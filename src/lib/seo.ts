import type { PageSignals } from "./htmlScan";

export type ChecklistItem = {
  id: string;
  group: "seo" | "geo";
  label: string;
  passed: boolean;
  hint: string;
};

export function computeChecklistFromPageSignals(signals: PageSignals): ChecklistItem[] {
  const title = signals.title ?? "";
  const hasSingleH1 = signals.h1Texts.length === 1;
  const hasSubheadings = signals.h2Count + signals.h3Count > 0;
  const imageAltOk = signals.imagesTotal === 0 || signals.imagesMissingAlt === 0;

  const items: ChecklistItem[] = [
    {
      id: "title-length",
      group: "seo",
      label: "Title tag is 10–60 characters",
      passed: title.length >= 10 && title.length <= 60,
      hint: signals.title ? `Currently ${title.length} characters.` : "No <title> tag found.",
    },
    {
      id: "meta-description",
      group: "seo",
      label: "Meta description is 50–160 characters",
      passed:
        !!signals.metaDescription &&
        signals.metaDescription.length >= 50 &&
        signals.metaDescription.length <= 160,
      hint: signals.metaDescription
        ? `Currently ${signals.metaDescription.length} characters.`
        : "Add a meta description.",
    },
    {
      id: "canonical",
      group: "seo",
      label: "Has a canonical URL",
      passed: !!signals.canonical,
      hint: "Prevents duplicate-content ambiguity for crawlers.",
    },
    {
      id: "single-h1",
      group: "seo",
      label: "Has exactly one H1",
      passed: hasSingleH1,
      hint: `Found ${signals.h1Texts.length} H1 tag(s).`,
    },
    {
      id: "subheadings",
      group: "seo",
      label: "Uses subheadings (H2/H3) to structure content",
      passed: hasSubheadings,
      hint: "Subheadings help both readers and crawlers parse structure.",
    },
    {
      id: "image-alt",
      group: "seo",
      label: "Images have alt text",
      passed: imageAltOk,
      hint:
        signals.imagesTotal === 0
          ? "No images on this page."
          : `${signals.imagesMissingAlt} of ${signals.imagesTotal} image(s) missing alt text.`,
    },
    {
      id: "not-noindex",
      group: "seo",
      label: "Not excluded from search via noindex",
      passed: !signals.noindex,
      hint: signals.noindex ? "This page is marked noindex." : "Page is indexable.",
    },
    {
      id: "body-length",
      group: "seo",
      label: "Body has at least 300 words",
      passed: signals.wordCount >= 300,
      hint: `Currently ${signals.wordCount} words.`,
    },
    {
      id: "structured-data",
      group: "geo",
      label: "Has Article/BlogPosting structured data",
      passed: signals.hasArticleSchema,
      hint: "Structured data helps AI systems parse authorship and dates accurately.",
    },
    {
      id: "faq",
      group: "geo",
      label: "Has FAQPage structured data",
      passed: signals.hasFaqSchema && signals.faqCount > 0,
      hint: "FAQPage schema helps AI engines extract direct answers.",
    },
    {
      id: "freshness",
      group: "geo",
      label: "Has a last-modified/published date",
      passed: !!signals.dateModified,
      hint: "Freshness is a trust signal AI crawlers weigh heavily.",
    },
    {
      id: "summary",
      group: "geo",
      label: "Has an answer-first lead paragraph",
      passed:
        !!signals.leadParagraph &&
        signals.leadParagraph.length >= 20 &&
        signals.leadParagraph.length <= 500,
      hint: "A concise, factual opening paragraph AI answer engines can quote directly.",
    },
    {
      id: "citations",
      group: "geo",
      label: "Cites at least one external source",
      passed: signals.citationsCount > 0,
      hint: "Citations increase trust signals for AI answer engines.",
    },
  ];

  return items;
}
