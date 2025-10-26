import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id },
      include: {
        waliKelas: true,
        orangTua: true,
        user: {
          select: { email: true }
        },
        pelanggaran: {
          include: {
            kategori: true,
            guru: true,
          },
          orderBy: { tanggal: "desc" }
        },
        prestasi: {
          include: {
            kategori: true,
            guru: true,
          },
          orderBy: { tanggal: "desc" }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json({ error: "Siswa not found" }, { status: 404 });
    }

    return NextResponse.json(siswa);
  } catch (error) {
    console.error("Get siswa detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["SUPERADMIN", "BK"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nama, kelas, gender, orangTuaId, waliKelasId } = await req.json();

    const siswa = await prisma.siswa.update({
      where: { id: params.id },
      data: {
        nama,
        kelas,
        gender,
        orangTuaId: orangTuaId || null,
        waliKelasId: waliKelasId || null,
      },
      include: {
        waliKelas: true,
        orangTua: true,
        user: {
          select: { email: true }
        }
      }
    });

    return NextResponse.json({
      message: "Siswa berhasil diperbarui",
      siswa
    });
  } catch (error) {
    console.error("Update siswa error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["SUPERADMIN", "BK"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get siswa with user relation
    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: "Siswa not found" }, { status: 404 });
    }

    // Delete siswa (will cascade delete pelanggaran and prestasi)
    await prisma.siswa.delete({
      where: { id: params.id }
    });

    // Also delete user account if exists
    if (siswa.userId) {
      await prisma.user.delete({
        where: { id: siswa.userId }
      }).catch(() => {
        // Ignore if user already deleted
      });
    }

    return NextResponse.json({ message: "Siswa berhasil dihapus" });
  } catch (error) {
    console.error("Delete siswa error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}