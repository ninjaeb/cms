import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ChecklistItem } from "@/lib/seo";
import { ScoreBar, ChecklistList } from "@/components/admin/ScoreDisplay";
import RecommendButton from "@/components/admin/RecommendButton";

export default async function PageScanDetail({
  params,
}: {
  params: Promise<{ runId: string; pageId: string }>;
}) {
  const { runId, pageId } = await params;
  const page = await prisma.pageScan.findUnique({ where: { id: pageId } });
  if (!page || page.scanRunId !== runId) notFound();

  const checklist = page.checklist as unknown as ChecklistItem[];
  const seoItems = checklist.filter((c) => c.group === "seo");
  const geoItems = checklist.filter((c) => c.group === "geo");

  return (
    <div>
      <Link href={`/admin/scan/${runId}`} className="text-sm text-neutral-500 hover:underline">
        ← Back to scan
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">{page.title || page.urlPath}</h1>
      <p className="mt-1 font-mono text-sm text-neutral-500">{page.urlPath}</p>
      <p className="mt-1 text-xs text-neutral-400">{page.filePath}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold text-neutral-900">
            SEO score — {page.seoScore}%
          </h2>
          <div className="mt-3">
            <ScoreBar score={page.seoScore} />
          </div>
          <div className="mt-4">
            <ChecklistList items={seoItems} />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold text-neutral-900">
            GEO score — {page.geoScore}%
          </h2>
          <div className="mt-3">
            <ScoreBar score={page.geoScore} />
          </div>
          <div className="mt-4">
            <ChecklistList items={geoItems} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">AI recommendations</h2>
          <RecommendButton pageId={page.id} hasExisting={!!page.aiRecommendation} />
        </div>
        {page.aiRecommendation ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-700">
            {page.aiRecommendation}
          </p>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            No recommendation generated yet. Requires GEMINI_API_KEY to be set on the server.
          </p>
        )}
      </div>
    </div>
  );
}
