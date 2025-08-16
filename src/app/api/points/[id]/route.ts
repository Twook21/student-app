import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const point = await prisma.pointRecord.findUnique({
    where: { id: params.id },
    include: { student: true, pointCategory: true, inputtedBy: true },
  });
  if (!point) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(point);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const point = await prisma.pointRecord.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(point);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.pointRecord.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
