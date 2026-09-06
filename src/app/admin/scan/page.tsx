import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RunScanButton from "@/components/admin/RunScanButton";
import { ScoreBar } from "@/components/admin/ScoreDisplay";

export default async function ScanPage() {
  const runs = await prisma.scanRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });
  const latestRun = runs[0];
  const latestPages = latestRun
    ? await prisma.pageScan.findMany({
        where: { scanRunId: latestRun.id },
        orderBy: { urlPath: "asc" },
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Scan</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Crawls the configured base URL for pages and scores each one.
          </p>
        </div>
        <RunScanButton />
      </div>

      {latestRun && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-neutral-900">
            Latest scan — {latestRun.baseUrl}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {latestRun.pageCount} page{latestRun.pageCount === 1 ? "" : "s"} · avg SEO{" "}
            {latestRun.avgSeoScore ?? "—"}% · avg GEO {latestRun.avgGeoScore ?? "—"}%
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Page</th>
                  <th className="px-4 py-3 font-medium">SEO</th>
                  <th className="px-4 py-3 font-medium">GEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {latestPages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/scan/${latestRun.id}/${page.id}`}
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
                {latestPages.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                      No pages found when crawling this URL.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {runs.length > 1 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-neutral-900">Past scans</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Pages</th>
                  <th className="px-4 py-3 font-medium">Avg SEO</th>
                  <th className="px-4 py-3 font-medium">Avg GEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {runs.slice(1).map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/scan/${run.id}`} className="hover:underline">
                        {run.startedAt.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{run.pageCount}</td>
                    <td className="px-4 py-3 text-neutral-500">{run.avgSeoScore ?? "—"}%</td>
                    <td className="px-4 py-3 text-neutral-500">{run.avgGeoScore ?? "—"}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {runs.length === 0 && (
        <p className="mt-8 text-sm text-neutral-500">No scans yet — click &quot;Run new scan&quot; to start.</p>
      )}
    </div>
  );
}
