import { markdownToHtml } from "@/lib/markdown";
import { parseCitations, parseEntities, type Citation } from "@/lib/seo";
import { ORGANIZATION_JSON_LD, SITE_NAME, SITE_ORIGIN } from "./design";
import { renderDocument } from "./document";

export type StaticBlogPostContent = {
  title: string;
  slug: string;
  body: string; // markdown
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  featuredImage: string | null;
  aiSummary: string | null;
  keyEntities: string | null;
  sourceCitations: string | null;
  lastFactCheckedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  faqItems: { question: string; answer: string }[];
};

export function blogPostPath(slug: string): string {
  return `/blog/${slug}/`;
}

export async function renderBlogPostHtml(content: StaticBlogPostContent): Promise<string> {
  const urlPath = blogPostPath(content.slug);
  const canonical = `${SITE_ORIGIN}${urlPath}`;
  const html = await markdownToHtml(content.body);
  const citations = parseCitations(content.sourceCitations);
  const entities = parseEntities(content.keyEntities);
  const dateLabel = (content.publishedAt || content.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd: object[] = [
    ORGANIZATION_JSON_LD,
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.metaDescription || content.excerpt || undefined,
      image: content.ogImage || content.featuredImage || undefined,
      author: content.authorName ? { "@type": "Person", name: content.authorName } : undefined,
      publisher: { "@type": "Organization", name: SITE_NAME },
      datePublished: (content.publishedAt || content.createdAt).toISOString(),
      dateModified: content.updatedAt.toISOString(),
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog/` },
        { "@type": "ListItem", position: 3, name: content.title, item: canonical },
      ],
    },
  ];
  if (content.faqItems.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqItems.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  const bodyMain = `<section class="phero">
  <div class="wrap">
    <span class="crumb"><a href="/">Home</a> / <a href="/blog/">Blog</a>${
      content.categoryName ? ` / ${escapeHtml(content.categoryName)}` : ""
    }</span>
    <span class="eyebrow">Blog</span>
    <h1>${escapeHtml(content.title)}</h1>
    ${content.excerpt ? `<p class="lead">${escapeHtml(content.excerpt)}</p>` : ""}
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="legal rv">
      <span class="upd">${dateLabel}${content.authorName ? ` · By ${escapeHtml(content.authorName)}` : ""}</span>
      ${
        content.aiSummary
          ? `<div style="background:var(--paper);border:1px solid var(--line);border-radius:var(--r-md,14px);padding:22px 26px;margin-bottom:32px">
        <p style="font:600 .72rem/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--petrol);margin:0 0 8px">Quick answer</p>
        <p style="margin:0;color:var(--ink)">${escapeHtml(content.aiSummary)}</p>
      </div>`
          : ""
      }
      ${html}
      ${
        entities.length > 0
          ? `<div class="chips" style="margin-top:28px">${entities
              .map((e) => `<span class="chip">${escapeHtml(e)}</span>`)
              .join("")}</div>`
          : ""
      }
      ${
        content.faqItems.length > 0
          ? `<h2 style="margin-top:48px">Frequently asked questions</h2>
      ${content.faqItems
        .map((f) => `<h3>${escapeHtml(f.question)}</h3>\n<p>${escapeHtml(f.answer)}</p>`)
        .join("\n")}`
          : ""
      }
      ${
        citations.length > 0
          ? `<h2 style="margin-top:48px">Sources</h2>
      <ul>${citations.map((c: Citation) => `<li><a href="${escapeAttr(c.url)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(c.label)}</a></li>`).join("")}</ul>`
          : ""
      }
      ${
        content.lastFactCheckedAt
          ? `<p style="margin-top:32px;font-size:.85rem;color:var(--ink-2)">Facts last verified ${content.lastFactCheckedAt.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}.</p>`
          : ""
      }
    </div>
  </div>
</section>`;

  return renderDocument({
    title: content.metaTitle || content.title,
    description: content.metaDescription || content.excerpt,
    canonical,
    ogImage: content.ogImage || content.featuredImage,
    activePath: urlPath,
    bodyMain,
    jsonLd,
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
