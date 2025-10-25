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

    let siswaId: string | null = null;

    // If user is SISWA role (parent), find their child
    if (session.user.role === "ORANGTUA") {
      const siswa = await prisma.siswa.findFirst({
        where: {
          orangTuaId: session.user.id,
        },
      });
      
      if (!siswa) {
        return NextResponse.json(
          { error: "Data siswa tidak ditemukan" },
          { status: 404 }
        );
      }
      
      siswaId = siswa.id;
    } else {
      // For other roles, we need siswaId from query or different logic
      return NextResponse.json(
        { error: "Endpoint ini hanya untuk orang tua siswa" },
        { status: 403 }
      );
    }

    // Get student data with all relations
    const siswaData = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        waliKelas: {
          select: {
            name: true,
            email: true,
          },
        },
        orangTua: {
          select: {
            name: true,
            email: true,
          },
        },
        pelanggaran: {
          include: {
            kategori: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            tanggal: "desc",
          },
        },
        prestasi: {
          include: {
            kategori: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: {
            tanggal: "desc",
          },
        },
      },
    });

    if (!siswaData) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      siswa: siswaData,
      pelanggaran: siswaData.pelanggaran,
      prestasi: siswaData.prestasi,
    });
  } catch (error) {
    console.error("Get siswa profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}