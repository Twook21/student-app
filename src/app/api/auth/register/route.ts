// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Types
interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  name: string;
  nisn?: string;
  nip?: string;
  classId?: string;
  parentData?: {
    childrenNisn: string[];
  };
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Helper function untuk validasi input
function validateInput(role: string, data: RegisterRequest): ValidationResult {
  const { email, password, name, nisn, nip } = data;
  
  // Basic validation
  if (!email || !password || !role || !name) {
    return {
      isValid: false,
      error: "Email, password, role, dan nama wajib diisi"
    };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Format email tidak valid"
    };
  }

  // Password strength validation
  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password minimal 6 karakter"
    };
  }

  // Role-specific validation
  if (role === "SISWA" && !nisn) {
    return {
      isValid: false,
      error: "NISN wajib diisi untuk siswa"
    };
  }
  
  if (role === "GURU" && !nip) {
    return {
      isValid: false,
      error: "NIP wajib diisi untuk guru"
    };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();
    const { email, password, role, name, nisn, nip, classId, parentData } = body;

    // Validasi input
    const validation = validateInput(role, body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Transaction untuk memastikan data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek email sudah terdaftar
      const existingUser = await tx.user.findUnique({ 
        where: { email } 
      });
      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }

      // 2. Validasi role-specific constraints
      if (role === "SISWA" && nisn) {
        const existingStudent = await tx.student.findUnique({
          where: { nisn }
        });
        if (existingStudent) {
          throw new Error("NISN sudah terdaftar");
        }
      }

      if (role === "GURU" && nip) {
        const existingTeacher = await tx.teacher.findUnique({
          where: { nip }
        });
        if (existingTeacher) {
          throw new Error("NIP sudah terdaftar");
        }
      }

      // 3. Pastikan role exists
      const roleRecord = await tx.role.findUnique({
        where: { name: role }
      });
      if (!roleRecord) {
        throw new Error(`Role ${role} tidak ditemukan`);
      }

      // 4. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 5. Generate registration token
      const registrationToken = crypto.randomUUID();

      // 6. Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          status: "PENDING",
          registrationToken,
          roles: {
            create: [{
              roleId: roleRecord.id
            }]
          }
        },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      // 7. Create role-specific data
      let specificData: any = null;

      if (role === "SISWA" && nisn) {
        specificData = await tx.student.create({
          data: {
            name,
            nisn,
            userId: newUser.id,
            classId: classId || null,
            totalPoint: 0
          }
        });
      } else if (role === "GURU" && nip) {
        specificData = await tx.teacher.create({
          data: {
            name,
            nip,
            userId: newUser.id,
            isHomeroom: false
          }
        });
      } else if (role === "ORANGTUA") {
        specificData = await tx.parent.create({
          data: {
            name,
            userId: newUser.id
          }
        });

        // Jika ada data anak yang perlu di-link
        if (parentData?.childrenNisn && parentData.childrenNisn.length > 0) {
          const students = await tx.student.findMany({
            where: {
              nisn: { in: parentData.childrenNisn }
            }
          });

          if (students.length > 0) {
            await tx.parentStudent.createMany({
              data: students.map(student => ({
                parentId: specificData.id,
                studentId: student.id
              }))
            });
          }
        }
      }

      // 8. Log activity
      await tx.activityLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTRATION",
          details: JSON.stringify({
            role,
            email,
            registrationToken,
            specificDataId: specificData?.id || null
          })
        }
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          status: newUser.status,
          roles: newUser.roles.map(ur => ur.role.name),
          registrationToken: newUser.registrationToken
        },
        specificData
      };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Menunggu persetujuan admin.",
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat registrasi";
    
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}

// GET endpoint untuk validasi token (opsional)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: "Token tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { registrationToken: token },
      include: {
        roles: {
          include: { role: true }
        },
        student: true,
        teacher: true,
        parent: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: user.email,
        status: user.status,
        roles: user.roles.map(ur => ur.role.name)
      }
    });

  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat validasi token" },
      { status: 500 }
    );
  }
}