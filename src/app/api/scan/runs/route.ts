import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = await prisma.scanRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(runs);
}
