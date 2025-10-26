import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email harus diisi" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Jika email terdaftar, link reset password akan dikirim",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email here
    // For now, we'll just log the token
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    console.log("=".repeat(50));
    console.log("Password Reset Link:");
    console.log(resetUrl);
    console.log("=".repeat(50));

    // TODO: Send email using your email service (Resend, SendGrid, etc)
    // await sendEmail({
    //   to: email,
    //   subject: "Reset Password - Sistem Poin Siswa",
    //   html: `<p>Klik link berikut untuk reset password: <a href="${resetUrl}">${resetUrl}</a></p>`
    // });

    return NextResponse.json({
      message: "Link reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}