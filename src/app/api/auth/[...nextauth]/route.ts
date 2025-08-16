// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Fetch user dengan roles dan data spesifik
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              roles: {
                include: {
                  role: true
                }
              },
              student: true,
              teacher: true,
              parent: true
            }
          });

          // Validasi user exists, password benar, dan status aktif
          if (!user || 
              !await bcrypt.compare(credentials.password, user.password) ||
              user.status !== "ACTIVE") {
            return null;
          }

          // Return user data untuk session
          return {
            id: user.id,
            email: user.email,
            roles: user.roles.map(ur => ur.role.name),
            status: user.status,
            student: user.student,
            teacher: user.teacher,
            parent: user.parent
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Persist user data in JWT token
      if (user) {
        token.roles = user.roles;
        token.status = user.status;
        token.student = user.student;
        token.teacher = user.teacher;
        token.parent = user.parent;
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to client
      if (token.sub) {
        session.user.id = token.sub;
        session.user.roles = token.roles || [];
        session.user.status = token.status || "PENDING";
        session.user.student = token.student || null;
        session.user.teacher = token.teacher || null;
        session.user.parent = token.parent || null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };