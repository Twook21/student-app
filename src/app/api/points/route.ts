import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const points = await prisma.pointRecord.findMany({
    include: { student: true, pointCategory: true, inputtedBy: true },
  });
  return NextResponse.json(points);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const point = await prisma.pointRecord.create({ data });
  // Update totalPoint siswa
  const student = await prisma.student.findUnique({
    where: { id: data.studentId },
  });
  if (student) {
    await prisma.student.update({
      where: { id: data.studentId },
      data: { totalPoint: student.totalPoint + data.pointValue },
    });
  }
  return NextResponse.json(point);
}
