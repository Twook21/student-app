import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      class: true,
      pointRecords: true,
      parentStudents: true,
    },
  });
  if (!student)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const student = await prisma.student.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(student);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.student.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
