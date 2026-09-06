import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { crawlSite } from "@/lib/htmlScan";
import { computeChecklistFromPageSignals } from "@/lib/seo";
import { scanRequestSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => ({}));
  const parsed = scanRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await getSettings();
  const baseUrl = parsed.data.baseUrl || settings.scanBaseUrl;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "No base URL configured. Set it in Settings first." },
      { status: 400 },
    );
  }

  const scanRun = await prisma.scanRun.create({ data: { baseUrl } });

  let pagesFound;
  try {
    pagesFound = await crawlSite(baseUrl);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to crawl ${baseUrl}: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 },
    );
  }

  let seoTotal = 0;
  let geoTotal = 0;
  let pageCount = 0;

  for (const signals of pagesFound) {
    const checklist = computeChecklistFromPageSignals(signals);
    const seoItems = checklist.filter((c) => c.group === "seo");
    const geoItems = checklist.filter((c) => c.group === "geo");
    const seoScore = Math.round((seoItems.filter((i) => i.passed).length / seoItems.length) * 100);
    const geoScore = Math.round((geoItems.filter((i) => i.passed).length / geoItems.length) * 100);

    await prisma.pageScan.create({
      data: {
        scanRunId: scanRun.id,
        sourceUrl: signals.sourceUrl,
        urlPath: signals.urlPath,
        title: signals.title,
        seoScore,
        geoScore,
        checklist,
      },
    });

    seoTotal += seoScore;
    geoTotal += geoScore;
    pageCount += 1;
  }

  const updated = await prisma.scanRun.update({
    where: { id: scanRun.id },
    data: {
      finishedAt: new Date(),
      pageCount,
      avgSeoScore: pageCount > 0 ? Math.round(seoTotal / pageCount) : null,
      avgGeoScore: pageCount > 0 ? Math.round(geoTotal / pageCount) : null,
    },
  });

  return NextResponse.json(updated);
}
