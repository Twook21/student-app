import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "WALIKELAS") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { approved } = await req.json();

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Status approval harus diisi" },
        { status: 400 }
      );
    }

    // Get pelanggaran data
    const pelanggaran = await prisma.pelanggaran.findUnique({
      where: { id: params.id },
      include: {
        siswa: {
          include: {
            waliKelas: true,
          },
        },
        guru: true,
      },
    });

    if (!pelanggaran) {
      return NextResponse.json(
        { error: "Pelanggaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify wali kelas owns this student
    if (pelanggaran.siswa.waliKelasId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk approve pelanggaran ini" },
        { status: 403 }
      );
    }

    if (approved) {
      // Approve - forward to BK
      const updatedPelanggaran = await prisma.pelanggaran.update({
        where: { id: params.id },
        data: {
          needsWaliKelasApproval: false,
          approvedByWaliKelasId: session.user.id,
          approvedByWaliKelasAt: new Date(),
          status: "MENUNGGU", // Now waiting for BK
        },
      });

      // Notify BK
      const bkUsers = await prisma.user.findMany({
        where: { role: "BK" },
      });

      for (const bk of bkUsers) {
        await prisma.notifikasi.create({
          data: {
            userId: bk.id,
            title: "Pelanggaran Perlu Approval BK",
            message: `Pelanggaran ${pelanggaran.siswa.nama} telah disetujui Wali Kelas`,
          },
        });
      }

      // Notify guru mapel
      await prisma.notifikasi.create({
        data: {
          userId: pelanggaran.guruId,
          title: "Pelanggaran Disetujui Wali Kelas",
          message: `Pelanggaran ${pelanggaran.siswa.nama} telah disetujui oleh Wali Kelas`,
        },
      });

      return NextResponse.json({
        message: "Pelanggaran disetujui dan diteruskan ke BK",
        pelanggaran: updatedPelanggaran,
      });
    } else {
      // Reject
      const updatedPelanggaran = await prisma.pelanggaran.update({
        where: { id: params.id },
        data: {
          status: "DITOLAK",
          catatanBK: "Ditolak oleh Wali Kelas",
        },
      });

      // Notify guru mapel
      await prisma.notifikasi.create({
        data: {
          userId: pelanggaran.guruId,
          title: "Pelanggaran Ditolak Wali Kelas",
          message: `Pelanggaran ${pelanggaran.siswa.nama} ditolak oleh Wali Kelas`,
        },
      });

      return NextResponse.json({
        message: "Pelanggaran ditolak",
        pelanggaran: updatedPelanggaran,
      });
    }
  } catch (error) {
    console.error("Wali kelas approve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}