import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { contentSchema } from "@/lib/validation";
import { syncContentToStaticSite } from "@/lib/staticSite/sync";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = contentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existingSlug = await prisma.content.findUnique({
    where: { slug_locale: { slug: data.slug, locale: data.locale } },
  });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug is already in use for this language." }, { status: 409 });
  }

  const created = await prisma.content.create({
    data: {
      type: data.type,
      status: data.status,
      locale: data.locale,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      body: data.body,
      isHomepage: data.isHomepage,
      featuredImage: data.featuredImage || null,
      publishedAt:
        data.status === "PUBLISHED"
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : data.publishedAt
            ? new Date(data.publishedAt)
            : null,
      authorId: session.userId,
      categoryId: data.categoryId || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      canonicalUrl: data.canonicalUrl || null,
      focusKeyword: data.focusKeyword || null,
      ogImage: data.ogImage || null,
      noindex: data.noindex,
      nofollow: data.nofollow,
      aiSummary: data.aiSummary || null,
      keyEntities: data.keyEntities || null,
      sourceCitations: data.sourceCitations.length ? JSON.stringify(data.sourceCitations) : null,
      lastFactCheckedAt: data.lastFactCheckedAt ? new Date(data.lastFactCheckedAt) : null,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      faqItems: {
        create: data.faqItems.map((f, i) => ({ question: f.question, answer: f.answer, order: i })),
      },
    },
  });

  await syncContentToStaticSite(created.id);

  return NextResponse.json({ id: created.id, slug: created.slug }, { status: 201 });
}
