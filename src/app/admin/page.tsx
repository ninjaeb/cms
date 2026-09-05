import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [total, published, drafts, faqCount] = await Promise.all([
    prisma.content.count(),
    prisma.content.count({ where: { status: "PUBLISHED" } }),
    prisma.content.count({ where: { status: "DRAFT" } }),
    prisma.faqItem.count(),
  ]);

  const missingAiSummary = await prisma.content.count({
    where: { status: "PUBLISHED", OR: [{ aiSummary: null }, { aiSummary: "" }] },
  });

  const stats = [
    { label: "Total content", value: total },
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "FAQ entries (GEO)", value: faqCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Overview of your content, SEO health, and GEO readiness.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {missingAiSummary > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {missingAiSummary} published item{missingAiSummary === 1 ? "" : "s"} missing an AI
          summary — this hurts how AI answer engines cite your content.{" "}
          <Link href="/admin/content" className="font-medium underline">
            Review content
          </Link>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/content/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New content
        </Link>
        <Link
          href="/admin/content"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Manage content
        </Link>
      </div>
    </div>
  );
}
