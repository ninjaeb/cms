import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-800",
  DRAFT: "bg-neutral-200 text-neutral-700",
  SCHEDULED: "bg-blue-100 text-blue-800",
};

export default async function ContentListPage() {
  const items = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true, faqItems: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Content</h1>
          <p className="mt-1 text-sm text-neutral-500">{items.length} item(s)</p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New content
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">GEO</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-neutral-500">/{item.slug}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">{item.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{item.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {item.aiSummary ? "✓ summary" : "— summary"}
                  {", "}
                  {item.faqItems.length} FAQ
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {item.updatedAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  No content yet. Create your first item.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
