import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

// Crawlers used by AI answer engines / LLM providers to source training and
// retrieval-time content. Toggle access to these from Settings → GEO.
const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
];

// Settings (siteUrl, allowAiCrawlers) are managed live in the admin — never
// prerender this at build time.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();

  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
  ];

  for (const userAgent of AI_CRAWLER_USER_AGENTS) {
    rules.push(
      settings.allowAiCrawlers
        ? { userAgent, allow: "/", disallow: ["/admin", "/api"] }
        : { userAgent, disallow: "/" },
    );
  }

  return {
    rules,
    sitemap: `${settings.siteUrl}/sitemap.xml`,
  };
}
