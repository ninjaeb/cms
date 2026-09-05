import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContentForm, { type ContentFormInitial } from "@/components/admin/ContentForm";
import { parseCitations } from "@/lib/seo";
import { normalizeLocale } from "@/lib/staticSite/i18n";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [content, categories, tags] = await Promise.all([
    prisma.content.findUnique({
      where: { id },
      include: { tags: true, faqItems: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!content) notFound();

  const initial: ContentFormInitial = {
    id: content.id,
    type: content.type,
    status: content.status,
    locale: normalizeLocale(content.locale),
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt ?? "",
    body: content.body,
    isHomepage: content.isHomepage,
    featuredImage: content.featuredImage ?? "",
    categoryId: content.categoryId ?? "",
    tagIds: content.tags.map((t) => t.tagId),
    metaTitle: content.metaTitle ?? "",
    metaDescription: content.metaDescription ?? "",
    canonicalUrl: content.canonicalUrl ?? "",
    focusKeyword: content.focusKeyword ?? "",
    ogImage: content.ogImage ?? "",
    noindex: content.noindex,
    nofollow: content.nofollow,
    aiSummary: content.aiSummary ?? "",
    keyEntities: content.keyEntities ?? "",
    sourceCitations: parseCitations(content.sourceCitations),
    lastFactCheckedAt: content.lastFactCheckedAt
      ? content.lastFactCheckedAt.toISOString().slice(0, 10)
      : "",
    faqItems: content.faqItems.map((f) => ({ question: f.question, answer: f.answer })),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Edit content</h1>
      <ContentForm categories={categories} tags={tags} initial={initial} />
    </div>
  );
}
