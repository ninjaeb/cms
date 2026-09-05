export type Citation = { label: string; url: string };

export function parseCitations(json: string | null | undefined): Citation[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Citation =>
        item && typeof item.label === "string" && typeof item.url === "string",
    );
  } catch {
    return [];
  }
}

export function parseEntities(csv: string | null | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

type ArticleLike = {
  title: string;
  slug: string;
  excerpt: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  author?: { name: string } | null;
};

export function buildArticleJsonLd(content: ArticleLike, siteUrl: string, siteName: string) {
  const url = `${siteUrl}/${content.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.metaDescription || content.excerpt || undefined,
    image: content.ogImage || content.featuredImage || undefined,
    author: content.author ? { "@type": "Person", name: content.author.name } : undefined,
    publisher: { "@type": "Organization", name: siteName },
    datePublished: (content.publishedAt || content.createdAt).toISOString(),
    dateModified: content.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

export function buildFaqJsonLd(faqItems: { question: string; answer: string }[]) {
  if (faqItems.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ChecklistItem = {
  id: string;
  group: "seo" | "geo";
  label: string;
  passed: boolean;
  hint: string;
};

export type ChecklistInput = {
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  featuredImage: string | null;
  body: string;
  aiSummary: string | null;
  keyEntities: string | null;
  sourceCitations: string | null;
  lastFactCheckedAt: Date | null;
  faqItemCount: number;
};

export function computeSeoChecklist(input: ChecklistInput): ChecklistItem[] {
  const wordCount = input.body.trim().split(/\s+/).filter(Boolean).length;
  const effectiveTitle = input.metaTitle || input.title;
  const hasHeading = /^#{2,3}\s+/m.test(input.body);
  const keyword = input.focusKeyword?.trim().toLowerCase();

  const items: ChecklistItem[] = [
    {
      id: "title-length",
      group: "seo",
      label: "Title tag is 10–60 characters",
      passed: effectiveTitle.length >= 10 && effectiveTitle.length <= 60,
      hint: `Currently ${effectiveTitle.length} characters.`,
    },
    {
      id: "meta-description",
      group: "seo",
      label: "Meta description is 50–160 characters",
      passed: !!input.metaDescription && input.metaDescription.length >= 50 && input.metaDescription.length <= 160,
      hint: input.metaDescription
        ? `Currently ${input.metaDescription.length} characters.`
        : "Add a meta description.",
    },
    {
      id: "slug",
      group: "seo",
      label: "Slug is short and URL-safe",
      passed: /^[a-z0-9-]+$/.test(input.slug) && input.slug.length <= 75,
      hint: "Use lowercase letters, numbers, and hyphens only.",
    },
    {
      id: "focus-keyword",
      group: "seo",
      label: "Focus keyword appears in the title",
      passed: !!keyword && effectiveTitle.toLowerCase().includes(keyword),
      hint: keyword ? "Keyword found in title." : "Set a focus keyword.",
    },
    {
      id: "featured-image",
      group: "seo",
      label: "Has a featured / social share image",
      passed: !!input.featuredImage,
      hint: "Used for Open Graph / Twitter cards.",
    },
    {
      id: "body-length",
      group: "seo",
      label: "Body has at least 300 words",
      passed: wordCount >= 300,
      hint: `Currently ${wordCount} words.`,
    },
    {
      id: "headings",
      group: "seo",
      label: "Uses subheadings (##/###) to structure content",
      passed: hasHeading,
      hint: "Subheadings help both readers and crawlers parse structure.",
    },
    {
      id: "ai-summary",
      group: "geo",
      label: "Has an answer-first AI summary",
      passed: !!input.aiSummary && input.aiSummary.length >= 20 && input.aiSummary.length <= 500,
      hint: "A concise, factual summary AI answer engines can quote directly.",
    },
    {
      id: "faq",
      group: "geo",
      label: "Has at least one FAQ entry",
      passed: input.faqItemCount > 0,
      hint: "FAQPage schema helps AI engines extract direct answers.",
    },
    {
      id: "citations",
      group: "geo",
      label: "Cites at least one external source",
      passed: parseCitations(input.sourceCitations).length > 0,
      hint: "Citations increase trust signals for AI answer engines.",
    },
    {
      id: "entities",
      group: "geo",
      label: "Lists key entities / topics",
      passed: parseEntities(input.keyEntities).length > 0,
      hint: "Explicit entities help AI systems understand what this content is about.",
    },
    {
      id: "freshness",
      group: "geo",
      label: "Facts have been verified recently",
      passed: !!input.lastFactCheckedAt,
      hint: "Freshness is a trust signal AI crawlers weigh heavily.",
    },
  ];

  return items;
}
