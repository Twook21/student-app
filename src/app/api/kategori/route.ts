import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get("tipe");

    let whereClause: any = {};

    if (tipe && (tipe === "PELANGGARAN" || tipe === "PRESTASI")) {
      whereClause.tipe = tipe;
    }

    const kategori = await prisma.kategori.findMany({
      where: whereClause,
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Get kategori error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["SUPERADMIN", "BK"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nama, tipe, poinDefault } = await req.json();

    // Validation
    if (!nama || !tipe || !poinDefault) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    if (!["PELANGGARAN", "PRESTASI"].includes(tipe)) {
      return NextResponse.json(
        { error: "Tipe tidak valid" },
        { status: 400 }
      );
    }

    const kategori = await prisma.kategori.create({
      data: {
        nama,
        tipe,
        poinDefault: parseInt(poinDefault),
      },
    });

    return NextResponse.json({
      message: "Kategori berhasil ditambahkan",
      kategori,
    }, { status: 201 });
  } catch (error) {
    console.error("Create kategori error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}