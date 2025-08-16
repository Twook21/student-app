import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });
  if (!notification)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(notification);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const notification = await prisma.notification.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(notification);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.notification.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
