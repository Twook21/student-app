import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const classObj = await prisma.class.findUnique({
    where: { id: params.id },
    include: { homeroomTeacher: true, students: true },
  });
  if (!classObj)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(classObj);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const classObj = await prisma.class.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(classObj);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.class.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
