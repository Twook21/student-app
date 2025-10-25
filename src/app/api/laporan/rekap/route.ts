import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["SUPERADMIN", "BK", "WALIKELAS"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kelas = searchParams.get("kelas");

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "WALIKELAS") {
      whereClause.waliKelasId = session.user.id;
    }

    if (kelas) {
      whereClause.kelas = kelas;
    }

    const siswaList = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        pelanggaran: {
          where: {
            status: "DISETUJUI",
          },
        },
        prestasi: {
          where: {
            status: "DISETUJUI",
          },
        },
      },
    });

    const rekap = siswaList.map((siswa) => ({
      siswa: siswa.nama,
      nis: siswa.nis,
      kelas: siswa.kelas,
      pelanggaran: siswa.pelanggaran.length,
      prestasi: siswa.prestasi.length,
      totalPoin: siswa.totalPoin,
    }));

    return NextResponse.json(rekap);
  } catch (error) {
    console.error("Get rekap error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}