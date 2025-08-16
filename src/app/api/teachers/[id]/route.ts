import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: params.id },
    include: { user: true, homeroomClass: true },
  });
  if (!teacher)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(teacher);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const teacher = await prisma.teacher.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(teacher);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.teacher.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
