import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { plainTextExcerpt } from "@/lib/markdown";
import { checkPublicApiKey, PUBLIC_CONTENT_CACHE_CONTROL } from "@/lib/publicApi";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Public, read-only listing of published Content — powers listing pages
// (e.g. a /blog index) on external sites without exposing drafts or the
// admin-only write API.
export async function GET(req: NextRequest) {
  const unauthorized = checkPublicApiKey(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = req.nextUrl;
  const typeParam = searchParams.get("type");
  const type = typeParam === "PAGE" || typeParam === "POST" ? typeParam : undefined;
  const categorySlug = searchParams.get("category") || undefined;
  const tagSlug = searchParams.get("tag") || undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const cursor = searchParams.get("cursor") || undefined;

  const items = await prisma.content.findMany({
    where: {
      status: "PUBLISHED",
      ...(type ? { type } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { category: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json(
    {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || plainTextExcerpt(item.body),
        featuredImage: item.featuredImage,
        aiSummary: item.aiSummary,
        category: item.category ? { name: item.category.name, slug: item.category.slug } : null,
        tags: item.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug })),
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
      })),
      nextCursor: items.length === limit ? items[items.length - 1].id : null,
    },
    { headers: { "Cache-Control": PUBLIC_CONTENT_CACHE_CONTROL } },
  );
}
