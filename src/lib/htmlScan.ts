import * as cheerio from "cheerio";

const MAX_PAGES = 200;
const FETCH_TIMEOUT_MS = 15000;
const SKIP_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|ico|css|js|pdf|zip|xml|txt|woff2?|ttf|mp4|mp3)$/i;

export type PageSignals = {
  sourceUrl: string;
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

function normalizeUrl(url: string): string {
  const u = new URL(url);
  u.hash = "";
  if (u.pathname !== "/" && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
  return u.toString();
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractSameOriginLinks($: cheerio.CheerioAPI, pageUrl: string, origin: string): string[] {
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return;
    }
    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.origin !== origin) return;
      if (SKIP_EXTENSIONS.test(resolved.pathname)) return;
      links.push(normalizeUrl(resolved.toString()));
    } catch {
      // Ignore unparseable hrefs.
    }
  });
  return links;
}

/**
 * Crawls a site starting from `startUrl`, following same-origin links
 * breadth-first, and parses every reachable HTML page into signals for
 * scoring. Stops at `MAX_PAGES` to bound crawl time/cost.
 */
export async function crawlSite(startUrl: string): Promise<PageSignals[]> {
  const start = normalizeUrl(startUrl);
  const origin = new URL(start).origin;

  const visited = new Set<string>();
  const queue: string[] = [start];
  const pages: PageSignals[] = [];

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const html = await fetchHtml(url);
    if (html === null) continue;

    const $ = cheerio.load(html);
    pages.push(parseSignalsFromDocument($, url));

    for (const link of extractSameOriginLinks($, url, origin)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }

  return pages;
}

/** Fetches and parses a single page by URL, used to re-score one page on demand. */
export async function fetchAndParsePage(url: string): Promise<PageSignals> {
  const html = await fetchHtml(url);
  if (html === null) throw new Error(`Could not fetch or parse ${url} (non-OK response or non-HTML content).`);
  const $ = cheerio.load(html);
  return parseSignalsFromDocument($, url);
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

function parseSignalsFromDocument($: cheerio.CheerioAPI, pageUrl: string): PageSignals {
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
    sourceUrl: pageUrl,
    urlPath: new URL(pageUrl).pathname || "/",
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
