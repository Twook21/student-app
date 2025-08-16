// app/api/admin/approval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Types
interface ApprovalRequest {
  userId: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}

// Endpoint untuk admin approve/reject registrasi
export async function PATCH(req: NextRequest) {
  try {
    // Cek session admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.roles?.includes('ADMIN')) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body: ApprovalRequest = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: "userId dan action (APPROVE/REJECT) wajib diisi" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Cari user yang pending
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          roles: { include: { role: true } },
          student: true,
          teacher: true,
          parent: true
        }
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      if (user.status !== "PENDING") {
        throw new Error("User sudah diproses sebelumnya");
      }

      // Update status berdasarkan action
      const newStatus = action === "APPROVE" ? "ACTIVE" : "INACTIVE";
      
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          registrationToken: null
        }
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: `USER_${action}`,
          details: JSON.stringify({
            targetUserId: userId,
            targetUserEmail: user.email,
            reason: reason || null,
            roles: user.roles.map(ur => ur.role.name)
          })
        }
      });

      // Jika di-reject, soft delete
      if (action === "REJECT") {
        const currentTime = new Date();
        
        await tx.user.update({
          where: { id: userId },
          data: { deletedAt: currentTime }
        });
      }

      // Create notification untuk user
      await tx.notification.create({
        data: {
          userId: userId,
          message: action === "APPROVE" 
            ? "Akun Anda telah disetujui dan sudah aktif. Silakan login."
            : `Akun Anda ditolak. ${reason ? `Alasan: ${reason}` : ""}`,
          isRead: false
        }
      });

      return {
        user: updatedUser,
        action,
        reason
      };
    });

    return NextResponse.json({
      success: true,
      message: `User berhasil ${action === "APPROVE" ? "disetujui" : "ditolak"}`,
      data: result
    });

  } catch (error) {
    console.error("Approval error:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses approval";
    
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}

// GET endpoint untuk list pending registrations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.roles?.includes('ADMIN')) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get registrations
    const users = await prisma.user.findMany({
      where: { 
        status,
        deletedAt: null
      },
      include: {
        roles: {
          include: { role: true }
        },
        student: true,
        teacher: true,
        parent: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.user.count({
      where: { 
        status,
        deletedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        status: user.status,
        roles: user.roles.map(ur => ur.role.name),
        createdAt: user.createdAt,
        registrationToken: user.registrationToken,
        specificData: {
          student: user.student,
          teacher: user.teacher,
          parent: user.parent
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get registrations error:", error);
    return NextResponse.json({
      error: "Terjadi kesalahan saat mengambil data registrasi"
    }, { status: 500 });
  }
}