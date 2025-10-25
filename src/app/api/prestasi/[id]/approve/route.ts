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

    // Get prestasi data
    const prestasi = await prisma.prestasi.findUnique({
      where: { id: params.id },
      include: {
        siswa: {
          include: {
            orangTua: true,
          },
        },
      },
    });

    if (!prestasi) {
      return NextResponse.json(
        { error: "Prestasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update prestasi status
    const updatedPrestasi = await prisma.prestasi.update({
      where: { id: params.id },
      data: {
        status,
        catatanBK: catatanBK || null,
      },
    });

    // Update total poin siswa if approved
    if (status === "DISETUJUI") {
      await prisma.siswa.update({
        where: { id: prestasi.siswaId },
        data: {
          totalPoin: {
            increment: prestasi.poin,
          },
        },
      });
    }

    // Create notification for student's parent
    if (prestasi.siswa.orangTua) {
      await prisma.notifikasi.create({
        data: {
          userId: prestasi.siswa.orangTua.id,
          title: `Prestasi ${status === "DISETUJUI" ? "Disetujui" : "Ditolak"}`,
          message: `Prestasi ${prestasi.siswa.nama} telah ${
            status === "DISETUJUI" ? "disetujui" : "ditolak"
          } oleh BK`,
        },
      });
    }

    return NextResponse.json({
      message: "Status prestasi berhasil diperbarui",
      prestasi: updatedPrestasi,
    });
  } catch (error) {
    console.error("Approve prestasi error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}