import Anthropic from "@anthropic-ai/sdk";
import type { ChecklistItem } from "./seo";
import type { PageSignals } from "./htmlScan";

const client = new Anthropic();

/**
 * Generates concrete, page-specific SEO/GEO improvement suggestions from a
 * scanned page's extracted signals and its rule-based checklist results.
 * Called lazily per-page from the UI, not automatically during a scan.
 */
export async function generateRecommendation(
  signals: PageSignals,
  checklist: ChecklistItem[],
): Promise<string> {
  const failed = checklist.filter((item) => !item.passed);

  if (failed.length === 0) {
    return "This page passes every automated SEO/GEO check — no fixes needed.";
  }

  const prompt = `You are an SEO and GEO (Generative Engine Optimization) auditor. Below is one page's extracted signals and the automated checks it failed. Write specific, actionable fixes for each failed check — reference the page's actual content where possible, not generic advice.

Page URL: ${signals.urlPath}
Title: ${signals.title ?? "(none)"}
Meta description: ${signals.metaDescription ?? "(none)"}
Word count: ${signals.wordCount}
H1 count: ${signals.h1Texts.length} (${signals.h1Texts.join("; ") || "none"})
Images: ${signals.imagesTotal} total, ${signals.imagesMissingAlt} missing alt text
Has Article/BlogPosting structured data: ${signals.hasArticleSchema}
Has FAQPage structured data: ${signals.hasFaqSchema}
Last modified/published date found: ${signals.dateModified ?? "none"}
Lead paragraph: ${signals.leadParagraph ?? "(none)"}
Citations found: ${signals.citationsCount}

Failed checks:
${failed.map((item) => `- ${item.label}: ${item.hint}`).join("\n")}

Write a short, specific recommendation for each failed check.`;

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}
