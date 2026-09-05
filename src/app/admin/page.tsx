import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const latestRun = await prisma.scanRun.findFirst({
    orderBy: { startedAt: "desc" },
  });
  const totalRuns = await prisma.scanRun.count();

  const stats = [
    { label: "Scan runs", value: totalRuns },
    { label: "Pages in last scan", value: latestRun?.pageCount ?? "—" },
    { label: "Avg SEO score", value: latestRun?.avgSeoScore != null ? `${latestRun.avgSeoScore}%` : "—" },
    { label: "Avg GEO score", value: latestRun?.avgGeoScore != null ? `${latestRun.avgGeoScore}%` : "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        SEO and GEO health across your scanned site.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {!latestRun && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No scans yet. Configure a root directory in Settings, then run your first scan.
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/scan"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Go to Scan
        </Link>
      </div>
    </div>
  );
}
