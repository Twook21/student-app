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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alasanSiswa } = await req.json();

    if (!alasanSiswa) {
      return NextResponse.json(
        { error: "Alasan banding harus diisi" },
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
      },
    });

    if (!pelanggaran) {
      return NextResponse.json(
        { error: "Pelanggaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify this is the student's violation or their parent
    let canAppeal = false;
    
    if (session.user.role === "SISWA") {
      const siswa = await prisma.siswa.findFirst({
        where: { userId: session.user.id },
      });
      canAppeal = siswa?.id === pelanggaran.siswaId;
    } else if (session.user.role === "ORANGTUA") {
      const siswa = await prisma.siswa.findFirst({
        where: { orangTuaId: session.user.id },
      });
      canAppeal = siswa?.id === pelanggaran.siswaId;
    }

    if (!canAppeal) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk mengajukan banding" },
        { status: 403 }
      );
    }

    // Update pelanggaran with appeal
    const updatedPelanggaran = await prisma.pelanggaran.update({
      where: { id: params.id },
      data: {
        alasanSiswa,
        status: "MENUNGGU", // Reset status to pending for BK review
      },
    });

    // Create notification for wali kelas and BK
    if (pelanggaran.siswa.waliKelas) {
      await prisma.notifikasi.create({
        data: {
          userId: pelanggaran.siswa.waliKelas.id,
          title: "Banding Pelanggaran",
          message: `${pelanggaran.siswa.nama} mengajukan banding untuk pelanggaran`,
        },
      });
    }

    // Notify BK users
    const bkUsers = await prisma.user.findMany({
      where: { role: "BK" },
    });

    for (const bk of bkUsers) {
      await prisma.notifikasi.create({
        data: {
          userId: bk.id,
          title: "Banding Pelanggaran",
          message: `${pelanggaran.siswa.nama} mengajukan banding untuk pelanggaran`,
        },
      });
    }

    return NextResponse.json({
      message: "Banding berhasil diajukan",
      pelanggaran: updatedPelanggaran,
    });
  } catch (error) {
    console.error("Appeal pelanggaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}