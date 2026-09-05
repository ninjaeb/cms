import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScoreBar } from "@/components/admin/ScoreDisplay";

export default async function ScanRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await prisma.scanRun.findUnique({
    where: { id: runId },
    include: { pages: { orderBy: { urlPath: "asc" } } },
  });
  if (!run) notFound();

  return (
    <div>
      <Link href="/admin/scan" className="text-sm text-neutral-500 hover:underline">
        ← Back to scans
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Scan — {run.rootDir}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {run.startedAt.toLocaleString()} · {run.pageCount} page{run.pageCount === 1 ? "" : "s"} ·
        avg SEO {run.avgSeoScore ?? "—"}% · avg GEO {run.avgGeoScore ?? "—"}%
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">SEO</th>
              <th className="px-4 py-3 font-medium">GEO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {run.pages.map((page) => (
              <tr key={page.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/scan/${run.id}/${page.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {page.title || page.urlPath}
                  </Link>
                  <p className="text-xs text-neutral-400">{page.urlPath}</p>
                </td>
                <td className="w-32 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ScoreBar score={page.seoScore} />
                    <span className="text-xs text-neutral-500">{page.seoScore}%</span>
                  </div>
                </td>
                <td className="w-32 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ScoreBar score={page.geoScore} />
                    <span className="text-xs text-neutral-500">{page.geoScore}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {run.pages.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  No HTML files found in the root directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
