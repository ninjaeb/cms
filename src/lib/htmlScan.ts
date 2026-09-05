import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const SKIP_DIRS = new Set(["node_modules", ".git", "cgi-bin", ".well-known"]);

export type PageSignals = {
  filePath: string;
  urlPath: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  ogImage: string | null;
  noindex: boolean;
  nofollow: boolean;
  h1Texts: string[];
  h2Count: number;
  h3Count: number;
  wordCount: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  hasArticleSchema: boolean;
  hasFaqSchema: boolean;
  faqCount: number;
  hasBreadcrumbSchema: boolean;
  dateModified: string | null;
  leadParagraph: string | null;
  citationsCount: number;
};

/** Recursively finds `*.html`/`*.htm` files under `rootDir`. */
export async function findHtmlFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(path.join(dir, entry.name));
      } else if (/\.html?$/i.test(entry.name)) {
        results.push(path.join(dir, entry.name));
      }
    }
  }

  await walk(rootDir);
  return results;
}

/** Derives a clean URL path from a file's location relative to `rootDir`. */
function computeUrlPath(filePath: string, rootDir: string): string {
  let rel = path.relative(rootDir, filePath).split(path.sep).join("/");
  rel = rel.endsWith("index.html") || rel.endsWith("index.htm")
    ? rel.slice(0, rel.lastIndexOf("index"))
    : rel.replace(/\.html?$/i, "");
  if (!rel.startsWith("/")) rel = `/${rel}`;
  if (!rel.endsWith("/")) rel += "/";
  return rel;
}

function collectJsonLd($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const objects: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const candidates = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as { "@graph"?: unknown })["@graph"])
          ? ((parsed as { "@graph": unknown[] })["@graph"] as unknown[])
          : [parsed];
      for (const c of candidates) {
        if (c && typeof c === "object") objects.push(c as Record<string, unknown>);
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });
  return objects;
}

function typeIncludes(obj: Record<string, unknown>, type: string): boolean {
  const t = obj["@type"];
  if (typeof t === "string") return t === type;
  if (Array.isArray(t)) return t.includes(type);
  return false;
}

function countCitations($: cheerio.CheerioAPI): number {
  let count = 0;
  $("h2, h3").each((_, el) => {
    const heading = $(el);
    if (!/sources|references|citations/i.test(heading.text())) return;
    let next = heading.next();
    while (next.length && !/^h[1-3]$/i.test(next.prop("tagName") ?? "")) {
      count += next.find('a[href^="http"]').length;
      next = next.next();
    }
  });
  return count;
}

/** Reads and parses one HTML file into a normalized signals shape for scoring. */
export async function parsePage(filePath: string, rootDir: string): Promise<PageSignals> {
  const html = await readFile(filePath, "utf-8");
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();

  const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const wordCount = $("body").text().trim().split(/\s+/).filter(Boolean).length;

  const images = $("img");
  const imagesMissingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;

  const jsonLd = collectJsonLd($);
  const articleObj = jsonLd.find((o) => typeIncludes(o, "Article") || typeIncludes(o, "BlogPosting"));
  const faqObj = jsonLd.find((o) => typeIncludes(o, "FAQPage"));
  const breadcrumbObj = jsonLd.find((o) => typeIncludes(o, "BreadcrumbList"));

  const leadParagraphText = $("main p, article p, body p").first().text().trim();

  return {
    filePath,
    urlPath: computeUrlPath(filePath, rootDir),
    title: $("title").first().text().trim() || null,
    metaDescription: $('meta[name="description"]').attr("content")?.trim() || null,
    canonical: $('link[rel="canonical"]').attr("href")?.trim() || null,
    ogImage: $('meta[property="og:image"]').attr("content")?.trim() || null,
    noindex: robotsMeta.includes("noindex"),
    nofollow: robotsMeta.includes("nofollow"),
    h1Texts: $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean),
    h2Count: $("h2").length,
    h3Count: $("h3").length,
    wordCount,
    imagesTotal: images.length,
    imagesMissingAlt,
    hasArticleSchema: !!articleObj,
    hasFaqSchema: !!faqObj,
    faqCount: faqObj && Array.isArray(faqObj.mainEntity) ? faqObj.mainEntity.length : 0,
    hasBreadcrumbSchema: !!breadcrumbObj,
    dateModified:
      (articleObj?.dateModified as string | undefined) ||
      (articleObj?.datePublished as string | undefined) ||
      null,
    leadParagraph: leadParagraphText || null,
    citationsCount: countCitations($),
  };
}
