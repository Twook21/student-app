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

    if (!session || session.user.role !== "BK") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, catatanBK } = await req.json();

    if (!status || !["DISETUJUI", "DITOLAK"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Get pelanggaran data
    const pelanggaran = await prisma.pelanggaran.findUnique({
      where: { id: params.id },
      include: {
        siswa: {
          include: {
            orangTua: true,
          },
        },
      },
    });

    if (!pelanggaran) {
      return NextResponse.json(
        { error: "Pelanggaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update pelanggaran status
    const updatedPelanggaran = await prisma.pelanggaran.update({
      where: { id: params.id },
      data: {
        status,
        catatanBK: catatanBK || null,
      },
    });

    // Update total poin siswa if approved
    if (status === "DISETUJUI") {
      await prisma.siswa.update({
        where: { id: pelanggaran.siswaId },
        data: {
          totalPoin: {
            decrement: pelanggaran.poin,
          },
        },
      });
    }

    // Create notification for student's parent
    if (pelanggaran.siswa.orangTua) {
      await prisma.notifikasi.create({
        data: {
          userId: pelanggaran.siswa.orangTua.id,
          title: `Pelanggaran ${status === "DISETUJUI" ? "Disetujui" : "Ditolak"}`,
          message: `Pelanggaran ${pelanggaran.siswa.nama} telah ${
            status === "DISETUJUI" ? "disetujui" : "ditolak"
          } oleh BK`,
        },
      });
    }

    return NextResponse.json({
      message: "Status pelanggaran berhasil diperbarui",
      pelanggaran: updatedPelanggaran,
    });
  } catch (error) {
    console.error("Approve pelanggaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}