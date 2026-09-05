import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";
import ContentCard from "@/components/public/ContentCard";

export default async function HomePage() {
  const settings = await getSettings();
  const items = await prisma.content.findMany({
    where: { type: "POST", status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">{settings.siteName}</h1>
          {settings.siteDescription && (
            <p className="mt-2 text-lg text-neutral-600">{settings.siteDescription}</p>
          )}
        </div>
        <div>
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={{
                slug: item.slug,
                title: item.title,
                excerpt: item.excerpt,
                publishedAt: item.publishedAt,
                category: item.category,
              }}
            />
          ))}
          {items.length === 0 && (
            <p className="text-neutral-500">No published content yet.</p>
          )}
        </div>
      </main>
      <SiteFooter siteName={settings.siteName} />
    </>
  );
}
