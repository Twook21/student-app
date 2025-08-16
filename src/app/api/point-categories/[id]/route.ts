import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.pointCategory.findUnique({
    where: { id: params.id },
    include: { pointRecords: true },
  });
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const category = await prisma.pointCategory.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.pointCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
