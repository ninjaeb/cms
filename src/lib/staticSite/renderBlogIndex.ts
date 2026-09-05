import { SITE_ORIGIN } from "./design";
import { renderDocument } from "./document";
import { blogPostPath } from "./renderBlogPost";

export type BlogIndexEntry = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  categoryName: string | null;
};

export function renderBlogIndexHtml(posts: BlogIndexEntry[]): string {
  const cards = posts
    .map((p) => {
      const date = (p.publishedAt || p.createdAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `<a class="fcard" href="${blogPostPath(p.slug)}" style="display:block;text-decoration:none;color:inherit">
        <p style="font:500 .72rem/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--petrol);margin:0 0 10px">${date}${p.categoryName ? ` · ${escapeHtml(p.categoryName)}` : ""}</p>
        <h3 style="margin:0 0 8px">${escapeHtml(p.title)}</h3>
        ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ""}
      </a>`;
    })
    .join("\n");

  const bodyMain = `<section class="phero">
  <div class="wrap">
    <span class="crumb"><a href="/">Home</a> / Blog</span>
    <span class="eyebrow">Blog</span>
    <h1>Insights &amp; updates</h1>
    <p class="lead">Guides and news from the Gotka Technologies team on hosting, domains, web design and running an online business.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="feat g2 rv">
      ${cards || `<p>No posts published yet — check back soon.</p>`}
    </div>
  </div>
</section>`;

  return renderDocument({
    title: "Blog",
    description: "Guides and news from the Gotka Technologies team on hosting, domains, web design and running an online business.",
    canonical: `${SITE_ORIGIN}/blog/`,
    activePath: "/blog/",
    bodyMain,
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
