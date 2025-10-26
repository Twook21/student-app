import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET - Fetch all students
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kelas = searchParams.get("kelas");

    let whereClause: any = {};

    // Filter by role
    if (session.user.role === "WALIKELAS") {
      // Wali kelas can only see their own class
      whereClause.waliKelasId = session.user.id;
    }

    if (kelas) {
      whereClause.kelas = kelas;
    }

    const siswa = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        waliKelas: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orangTua: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        nama: "asc"
      }
    });

    return NextResponse.json(siswa);

  } catch (error) {
    console.error("Get siswa error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new student
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["SUPERADMIN", "BK"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nama, nis, kelas, gender, orangTuaId, waliKelasId, createAccount, email, password } = await req.json();

    // Validation
    if (!nama || !nis || !kelas || !gender) {
      return NextResponse.json(
        { error: "Nama, NIS, Kelas, dan Jenis Kelamin harus diisi" },
        { status: 400 }
      );
    }

    // Check if NIS already exists
    const existingSiswa = await prisma.siswa.findUnique({
      where: { nis }
    });

    if (existingSiswa) {
      return NextResponse.json(
        { error: "NIS sudah terdaftar" },
        { status: 400 }
      );
    }

    let userId = null;

    // Create user account if requested
    if (createAccount) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email dan password harus diisi untuk membuat akun" },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 400 }
        );
      }

      // Create user account for student
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: nama,
          email,
          password: hashedPassword,
          role: "SISWA",
        }
      });

      userId = user.id;
    }

    const siswa = await prisma.siswa.create({
      data: {
        nama,
        nis,
        kelas,
        gender,
        orangTuaId: orangTuaId || null,
        waliKelasId: waliKelasId || null,
        userId,
      },
      include: {
        waliKelas: {
          select: { name: true }
        },
        orangTua: {
          select: { name: true }
        },
        user: {
          select: { email: true }
        }
      }
    });

    return NextResponse.json({
      message: "Siswa berhasil ditambahkan",
      siswa
    }, { status: 201 });

  } catch (error) {
    console.error("Create siswa error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}