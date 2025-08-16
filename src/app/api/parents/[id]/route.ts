import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const parent = await prisma.parent.findUnique({
    where: { id: params.id },
    include: { user: true, parentStudents: true },
  });
  if (!parent)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(parent);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const parent = await prisma.parent.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(parent);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.parent.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
