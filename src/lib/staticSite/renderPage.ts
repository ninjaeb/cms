import { HOMEPAGE_ORGANIZATION_JSON_LD, ORGANIZATION_JSON_LD, SITE_ORIGIN } from "./design";
import { renderDocument } from "./document";
import { localePrefix, type Locale } from "./i18n";

export type StaticPageContent = {
  title: string;
  slug: string;
  body: string; // raw HTML, inserted directly — not markdown-processed
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  featuredImage: string | null;
  isHomepage: boolean;
  locale: Locale;
};

/** Unprefixed path for this page, e.g. "/" or "/about/" — same shape at every locale. */
function unprefixedPagePath(content: Pick<StaticPageContent, "slug" | "isHomepage">): string {
  return content.isHomepage ? "/" : `/${content.slug}/`;
}

/** Full, locale-prefixed path this page is written to and served at. */
export function pagePath(content: Pick<StaticPageContent, "slug" | "isHomepage" | "locale">): string {
  const prefix = localePrefix(content.locale);
  const base = unprefixedPagePath(content);
  return content.isHomepage ? `${prefix}/` : `${prefix}${base}`;
}

/**
 * Renders a PAGE-type Content item as a full static HTML document. The body
 * is raw HTML (authored directly in the admin, not Markdown) so hand-crafted
 * layouts — pricing tables, grids, forms — are reproduced exactly rather
 * than flattened through a generic content pipeline.
 */
export function renderStaticPageHtml(content: StaticPageContent): string {
  const activePath = unprefixedPagePath(content);
  const canonical = `${SITE_ORIGIN}${pagePath(content)}`;

  return renderDocument({
    title: content.metaTitle || content.title,
    description: content.metaDescription || content.excerpt,
    canonical,
    ogImage: content.ogImage || content.featuredImage,
    activePath,
    locale: content.locale,
    bodyMain: content.body,
    jsonLd: [content.isHomepage ? HOMEPAGE_ORGANIZATION_JSON_LD : ORGANIZATION_JSON_LD],
    hreflang: {
      en: `${SITE_ORIGIN}${activePath}`,
      ms: `${SITE_ORIGIN}/ms${activePath}`,
      zh: `${SITE_ORIGIN}/zh${activePath}`,
    },
  });
}
