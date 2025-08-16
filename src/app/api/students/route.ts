import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const students = await prisma.student.findMany({
    include: {
      user: true,
      class: true,
      pointRecords: true,
      parentStudents: true,
    },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const student = await prisma.student.create({ data });
  return NextResponse.json(student);
}
