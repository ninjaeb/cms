import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parsePage } from "@/lib/htmlScan";
import type { ChecklistItem } from "@/lib/seo";
import { generateRecommendation } from "@/lib/aiRecommend";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pageScan = await prisma.pageScan.findUnique({
    where: { id },
    include: { scanRun: true },
  });
  if (!pageScan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let signals;
  try {
    signals = await parsePage(pageScan.filePath, pageScan.scanRun.rootDir);
  } catch (err) {
    return NextResponse.json(
      { error: `Could not re-read the source file: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 },
    );
  }

  const recommendation = await generateRecommendation(
    signals,
    pageScan.checklist as unknown as ChecklistItem[],
  );

  const updated = await prisma.pageScan.update({
    where: { id },
    data: { aiRecommendation: recommendation },
  });

  return NextResponse.json(updated);
}
