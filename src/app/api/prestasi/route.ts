import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Fetch all prestasi
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "WALIKELAS" || session.user.role === "GURUMAPEL") {
      whereClause.siswa = {
        waliKelasId: session.user.id,
      };
    }

    const prestasi = await prisma.prestasi.findMany({
      where: whereClause,
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true,
          },
        },
        guru: {
          select: {
            id: true,
            name: true,
          },
        },
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return NextResponse.json(prestasi);
  } catch (error) {
    console.error("Get prestasi error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new prestasi
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["WALIKELAS", "GURUMAPEL", "BK"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siswaId, kategoriId, deskripsi, poin } = await req.json();

    // Validation
    if (!siswaId || !kategoriId || !deskripsi || !poin) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Create prestasi
    const prestasi = await prisma.prestasi.create({
      data: {
        siswaId,
        guruId: session.user.id,
        kategoriId,
        deskripsi,
        poin,
        status: "MENUNGGU",
      },
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            orangTua: true,
          },
        },
        kategori: {
          select: {
            nama: true,
          },
        },
      },
    });

    // Create notification for student's parent
    if (prestasi.siswa.orangTua) {
      await prisma.notifikasi.create({
        data: {
          userId: prestasi.siswa.orangTua.id,
          title: "Prestasi Baru",
          message: `${prestasi.siswa.nama} mendapat prestasi: ${prestasi.kategori.nama}`,
        },
      });
    }

    return NextResponse.json({
      message: "Prestasi berhasil diinput, menunggu approval BK",
      prestasi,
    }, { status: 201 });
  } catch (error) {
    console.error("Create prestasi error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}