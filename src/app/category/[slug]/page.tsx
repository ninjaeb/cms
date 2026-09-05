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
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!category) notFound();

  const items = await prisma.content.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
        {category.description && <p className="mt-2 text-lg text-neutral-600">{category.description}</p>}
        <div className="mt-8">
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
          {items.length === 0 && <p className="text-neutral-500">No content in this category yet.</p>}
        </div>
      </main>
      <SiteFooter siteName={settings.siteName} />
    </>
  );
}
