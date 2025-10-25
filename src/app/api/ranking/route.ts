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

    const siswaList = await prisma.siswa.findMany({
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
      orderBy: {
        totalPoin: "desc",
      },
    });

    const ranking = siswaList.map((siswa, index) => ({
      rank: index + 1,
      nama: siswa.nama,
      nis: siswa.nis,
      kelas: siswa.kelas,
      totalPoin: siswa.totalPoin,
      pelanggaran: siswa.pelanggaran.length,
      prestasi: siswa.prestasi.length,
    }));

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Get ranking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}