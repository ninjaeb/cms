import { SITE_ORIGIN } from "./design";
import { renderDocument } from "./document";
import { blogPostPath } from "./renderBlogPost";
import { UI, dateLocale, localePrefix, type Locale } from "./i18n";

export type BlogIndexEntry = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  categoryName: string | null;
};

export function blogIndexPath(locale: Locale): string {
  return `${localePrefix(locale)}/blog/`;
}

export function renderBlogIndexHtml(posts: BlogIndexEntry[], locale: Locale): string {
  const t = UI[locale];
  const dl = dateLocale(locale);
  const prefix = localePrefix(locale);

  const cards = posts
    .map((p) => {
      const date = (p.publishedAt || p.createdAt).toLocaleDateString(dl, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `<a class="fcard" href="${blogPostPath(locale, p.slug)}" style="display:block;text-decoration:none;color:inherit">
        <p style="font:500 .72rem/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--petrol);margin:0 0 10px">${date}${p.categoryName ? ` · ${escapeHtml(p.categoryName)}` : ""}</p>
        <h3 style="margin:0 0 8px">${escapeHtml(p.title)}</h3>
        ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ""}
      </a>`;
    })
    .join("\n");

  const bodyMain = `<section class="phero">
  <div class="wrap">
    <span class="crumb"><a href="${prefix}/">${t.home}</a> / ${t.blog}</span>
    <span class="eyebrow">${t.blogTitle}</span>
    <h1>${t.blogHeading}</h1>
    <p class="lead">${t.blogLead}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="feat g2 rv">
      ${cards || `<p>${t.noPosts}</p>`}
    </div>
  </div>
</section>`;

  const activePath = "/blog/";
  return renderDocument({
    title: t.blogTitle,
    description: t.blogLead,
    canonical: `${SITE_ORIGIN}${blogIndexPath(locale)}`,
    activePath,
    locale,
    bodyMain,
    hreflang: {
      en: `${SITE_ORIGIN}${activePath}`,
      ms: `${SITE_ORIGIN}/ms${activePath}`,
      zh: `${SITE_ORIGIN}/zh${activePath}`,
    },
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
