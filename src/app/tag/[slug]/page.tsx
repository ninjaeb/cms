import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";
import ContentCard from "@/components/public/ContentCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  return { title: `#${tag.name}` };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tag, settings] = await Promise.all([
    prisma.tag.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!tag) notFound();

  const links = await prisma.contentTag.findMany({
    where: { tagId: tag.id, content: { status: "PUBLISHED" } },
    include: { content: { include: { category: true } } },
    orderBy: { content: { publishedAt: "desc" } },
  });

  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold text-neutral-900">#{tag.name}</h1>
        <div className="mt-8">
          {links.map(({ content }) => (
            <ContentCard
              key={content.id}
              item={{
                slug: content.slug,
                title: content.title,
                excerpt: content.excerpt,
                publishedAt: content.publishedAt,
                category: content.category,
              }}
            />
          ))}
          {links.length === 0 && <p className="text-neutral-500">No content tagged yet.</p>}
        </div>
      </main>
      <SiteFooter siteName={settings.siteName} />
    </>
  );
}
