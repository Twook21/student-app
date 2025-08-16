import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user || !("id" in session.user))
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const userId = (session.user as { id: string }).id;
const logs = await prisma.activityLog.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});
  return NextResponse.json(logs);
}
