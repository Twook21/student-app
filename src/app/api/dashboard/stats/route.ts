import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let siswaWhere: any = {};
    let pelanggaranWhere: any = {};
    let prestasiWhere: any = {};

    // Filter data based on role
    if (session.user.role === "WALIKELAS") {
      siswaWhere.waliKelasId = session.user.id;
      pelanggaranWhere.siswa = { waliKelasId: session.user.id };
      prestasiWhere.siswa = { waliKelasId: session.user.id };
    }

    // Get statistics
    const [
      totalSiswa,
      totalPelanggaran,
      totalPrestasi,
      pelanggaranMenunggu,
      prestasiMenunggu,
    ] = await Promise.all([
      prisma.siswa.count({ where: siswaWhere }),
      prisma.pelanggaran.count({ where: pelanggaranWhere }),
      prisma.prestasi.count({ where: prestasiWhere }),
      prisma.pelanggaran.count({
        where: {
          ...pelanggaranWhere,
          status: "MENUNGGU",
        },
      }),
      prisma.prestasi.count({
        where: {
          ...prestasiWhere,
          status: "MENUNGGU",
        },
      }),
    ]);

    return NextResponse.json({
      totalSiswa,
      totalPelanggaran,
      totalPrestasi,
      pelanggaranMenunggu,
      prestasiMenunggu,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}