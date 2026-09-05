import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { contentSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = contentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (data.slug !== existing.slug) {
    const slugTaken = await prisma.content.findUnique({ where: { slug: data.slug } });
    if (slugTaken) return NextResponse.json({ error: "Slug is already in use." }, { status: 409 });
  }

  const publishedAt =
    data.status === "PUBLISHED" && !existing.publishedAt
      ? new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : existing.publishedAt;

  await prisma.$transaction([
    prisma.contentTag.deleteMany({ where: { contentId: id } }),
    prisma.faqItem.deleteMany({ where: { contentId: id } }),
    prisma.content.update({
      where: { id },
      data: {
        type: data.type,
        status: data.status,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        body: data.body,
        featuredImage: data.featuredImage || null,
        publishedAt,
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
        sourceCitations: data.sourceCitations.length
          ? JSON.stringify(data.sourceCitations)
          : null,
        lastFactCheckedAt: data.lastFactCheckedAt ? new Date(data.lastFactCheckedAt) : null,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        faqItems: {
          create: data.faqItems.map((f, i) => ({
            question: f.question,
            answer: f.answer,
            order: i,
          })),
        },
      },
    }),
  ]);

  return NextResponse.json({ id, slug: data.slug });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.content.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
