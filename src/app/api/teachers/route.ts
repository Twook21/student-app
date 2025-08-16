import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teachers = await prisma.teacher.findMany({
    include: { user: true, homeroomClass: true },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const teacher = await prisma.teacher.create({ data });
  return NextResponse.json(teacher);
}
