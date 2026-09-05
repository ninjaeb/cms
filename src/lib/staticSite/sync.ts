import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { renderStaticPageHtml, pagePath } from "./renderPage";
import { renderBlogPostHtml, blogPostPath } from "./renderBlogPost";
import { renderBlogIndexHtml, blogIndexPath } from "./renderBlogIndex";
import { LOCALES, normalizeLocale, type Locale } from "./i18n";

type ContentWithRelations = Awaited<ReturnType<typeof fetchContentForSync>>;

async function fetchContentForSync(id: string) {
  return prisma.content.findUnique({
    where: { id },
    include: { category: true, author: true, faqItems: { orderBy: { order: "asc" } } },
  });
}

function getStaticSiteDir(): string | null {
  const dir = process.env.STATIC_SITE_DIR?.trim();
  return dir ? dir : null;
}

function targetFilePath(dir: string, content: NonNullable<ContentWithRelations>): string {
  const locale = normalizeLocale(content.locale);
  const urlPath =
    content.type === "POST" ? blogPostPath(locale, content.slug) : pagePath({ ...content, locale });
  return path.join(dir, urlPath, "index.html");
}

/**
 * Renders and writes a Content item to the linked static site (public_html),
 * if STATIC_SITE_DIR is configured. Best-effort: logs and swallows errors so
 * a filesystem problem never breaks the admin's save/publish action.
 */
export async function syncContentToStaticSite(id: string): Promise<void> {
  const dir = getStaticSiteDir();
  if (!dir) return;

  try {
    const content = await fetchContentForSync(id);
    if (!content) return;
    const locale = normalizeLocale(content.locale);
    if (content.status !== "PUBLISHED" || content.noindex) {
      await removeContentFromStaticSite(content);
      if (content.type === "POST") await regenerateBlogIndex(locale);
      return;
    }

    const html =
      content.type === "POST"
        ? await renderBlogPostHtml({
            title: content.title,
            slug: content.slug,
            locale,
            body: content.body,
            excerpt: content.excerpt,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
            ogImage: content.ogImage,
            featuredImage: content.featuredImage,
            aiSummary: content.aiSummary,
            keyEntities: content.keyEntities,
            sourceCitations: content.sourceCitations,
            lastFactCheckedAt: content.lastFactCheckedAt,
            publishedAt: content.publishedAt,
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
            authorName: content.author?.name ?? null,
            categoryName: content.category?.name ?? null,
            categorySlug: content.category?.slug ?? null,
            faqItems: content.faqItems.map((f) => ({ question: f.question, answer: f.answer })),
          })
        : renderStaticPageHtml({
            title: content.title,
            slug: content.slug,
            locale,
            body: content.body,
            excerpt: content.excerpt,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
            ogImage: content.ogImage,
            featuredImage: content.featuredImage,
            isHomepage: content.isHomepage,
          });

    const filePath = targetFilePath(dir, content);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html, "utf8");

    if (content.type === "POST") await regenerateBlogIndex(locale);
  } catch (err) {
    console.error(`[staticSite] Failed to sync content ${id} to static site:`, err);
  }
}

/**
 * Removes a Content item's file from the static site (e.g. on unpublish or
 * delete). Never removes the homepage file — an accidental deletion there
 * would take the entire live site down, so a stale homepage is always
 * safer than a missing one.
 */
export async function removeContentFromStaticSite(
  content: Pick<NonNullable<ContentWithRelations>, "id" | "type" | "slug" | "isHomepage" | "locale">,
): Promise<void> {
  const dir = getStaticSiteDir();
  if (!dir) return;
  if (content.type === "PAGE" && content.isHomepage) {
    console.warn(`[staticSite] Skipping removal of homepage file for content ${content.id}.`);
    return;
  }

  try {
    const locale = normalizeLocale(content.locale);
    const urlPath =
      content.type === "POST" ? blogPostPath(locale, content.slug) : pagePath({ ...content, locale });
    const dirPath = path.join(dir, urlPath);
    await fs.rm(dirPath, { recursive: true, force: true });
    if (content.type === "POST") await regenerateBlogIndex(locale);
  } catch (err) {
    console.error(`[staticSite] Failed to remove content ${content.id} from static site:`, err);
  }
}

export async function regenerateBlogIndex(locale: Locale): Promise<void> {
  const dir = getStaticSiteDir();
  if (!dir) return;

  try {
    const posts = await prisma.content.findMany({
      where: { type: "POST", status: "PUBLISHED", noindex: false, locale },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });

    const html = renderBlogIndexHtml(
      posts.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        categoryName: p.category?.name ?? null,
      })),
      locale,
    );

    const filePath = path.join(dir, blogIndexPath(locale), "index.html");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html, "utf8");
  } catch (err) {
    console.error(`[staticSite] Failed to regenerate blog index (${locale}):`, err);
  }
}

/** Regenerates the blog index for every locale — useful after a bulk import/seed. */
export async function regenerateAllBlogIndexes(): Promise<void> {
  for (const locale of LOCALES) {
    await regenerateBlogIndex(locale);
  }
}
