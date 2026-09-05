import { HOMEPAGE_ORGANIZATION_JSON_LD, ORGANIZATION_JSON_LD, SITE_ORIGIN } from "./design";
import { renderDocument } from "./document";

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
};

export function pagePath(content: Pick<StaticPageContent, "slug" | "isHomepage">): string {
  return content.isHomepage ? "/" : `/${content.slug}/`;
}

/**
 * Renders a PAGE-type Content item as a full static HTML document. The body
 * is raw HTML (authored directly in the admin, not Markdown) so hand-crafted
 * layouts — pricing tables, grids, forms — are reproduced exactly rather
 * than flattened through a generic content pipeline.
 */
export function renderStaticPageHtml(content: StaticPageContent): string {
  const urlPath = pagePath(content);
  const canonical = `${SITE_ORIGIN}${urlPath}`;

  return renderDocument({
    title: content.metaTitle || content.title,
    description: content.metaDescription || content.excerpt,
    canonical,
    ogImage: content.ogImage || content.featuredImage,
    activePath: urlPath,
    bodyMain: content.body,
    jsonLd: [content.isHomepage ? HOMEPAGE_ORGANIZATION_JSON_LD : ORGANIZATION_JSON_LD],
    hreflang: {
      en: canonical,
      ms: `${SITE_ORIGIN}/ms${urlPath}`,
      zh: `${SITE_ORIGIN}/zh${urlPath}`,
    },
  });
}
