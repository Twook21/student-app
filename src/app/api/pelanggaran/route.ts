import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Fetch all pelanggaran
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "WALIKELAS") {
      // Wali kelas can only see their own class students
      whereClause.siswa = {
        waliKelasId: session.user.id
      };
    } else if (session.user.role === "SISWA") {
      // Student can only see their own violations
      const siswa = await prisma.siswa.findFirst({
        where: {
          orangTua: {
            id: session.user.id
          }
        }
      });
      if (siswa) {
        whereClause.siswaId = siswa.id;
      }
    }

    const pelanggaran = await prisma.pelanggaran.findMany({
      where: whereClause,
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            kelas: true
          }
        },
        guru: {
          select: {
            id: true,
            name: true
          }
        },
        kategori: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        tanggal: "desc"
      }
    });

    return NextResponse.json(pelanggaran);

  } catch (error) {
    console.error("Get pelanggaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new pelanggaran
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // allow WALIKELAS, BK and GURUMAPEL to create pelanggaran
    if (!session || !["WALIKELAS", "BK", "GURUMAPEL"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siswaId, kategoriId, deskripsi, poin, fotoUrl } = await req.json();

    // Validation (allow poin = 0)
    if (!siswaId || !kategoriId || !deskripsi || poin === undefined || poin === null) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // set needsWaliKelasApproval berdasarkan siapa yang menginput
    const needsWali = session.user.role === "GURUMAPEL";

    // Create pelanggaran (simpan fotoUrl dan flag kebutuhan approval wali kelas)
    const pelanggaran = await prisma.pelanggaran.create({
      data: {
        siswaId,
        guruId: session.user.id,
        kategoriId,
        deskripsi,
        poin,
        status: "MENUNGGU",
        fotoUrl: fotoUrl || null,
        needsWaliKelasApproval: needsWali
      },
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: true,
            orangTua: true
          }
        },
        kategori: {
          select: {
            nama: true
          }
        }
      }
    });

    // Create notification for student's parent
    if (pelanggaran.siswa.orangTua) {
      await prisma.notifikasi.create({
        data: {
          userId: pelanggaran.siswa.orangTua.id,
          title: "Pelanggaran Baru",
          message: `${pelanggaran.siswa.nama} mendapat pelanggaran: ${pelanggaran.kategori.nama}`
        }
      });
    }

    return NextResponse.json({
      message: "Pelanggaran berhasil diinput, menunggu approval BK",
      pelanggaran
    }, { status: 201 });

  } catch (error) {
    console.error("Create pelanggaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}