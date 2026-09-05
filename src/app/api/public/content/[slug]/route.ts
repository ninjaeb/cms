import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markdownToHtml } from "@/lib/markdown";
import { parseCitations, parseEntities } from "@/lib/seo";
import { checkPublicApiKey, PUBLIC_CONTENT_CACHE_CONTROL } from "@/lib/publicApi";

// Public, read-only lookup of a single published Content item by slug — the
// shape external sites (e.g. gotka.com's PHP CMS client) consume to render
// CMS-managed content inside their own page templates.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const unauthorized = checkPublicApiKey(req);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
      faqItems: { orderBy: { order: "asc" } },
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = await markdownToHtml(content.body);

  return NextResponse.json(
    {
      content: {
        id: content.id,
        type: content.type,
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        html,
        aiSummary: content.aiSummary,
        keyEntities: parseEntities(content.keyEntities),
        sourceCitations: parseCitations(content.sourceCitations),
        featuredImage: content.featuredImage,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        canonicalUrl: content.canonicalUrl,
        ogImage: content.ogImage,
        noindex: content.noindex,
        author: content.author ? { name: content.author.name } : null,
        category: content.category
          ? { name: content.category.name, slug: content.category.slug }
          : null,
        tags: content.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug })),
        faqItems: content.faqItems.map((f) => ({ question: f.question, answer: f.answer })),
        publishedAt: content.publishedAt,
        updatedAt: content.updatedAt,
        lastFactCheckedAt: content.lastFactCheckedAt,
      },
    },
    { headers: { "Cache-Control": PUBLIC_CONTENT_CACHE_CONTROL } },
  );
}
