import { prisma } from "@/lib/prisma";
import RedirectManager from "@/components/admin/RedirectManager";

export default async function RedirectsPage() {
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Redirects</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Preserve SEO equity when URLs change by redirecting old paths to new ones.
      </p>
      <RedirectManager initial={redirects} />
    </div>
  );
}
