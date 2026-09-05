import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

// Implements the emerging llms.txt convention (https://llmstxt.org): a
// plain-markdown index that helps LLMs and AI answer engines discover and
// correctly cite a site's content without having to crawl and parse full HTML.
export async function GET() {
  const settings = await getSettings();

  const content = await prisma.content.findMany({
    where: { status: "PUBLISHED", noindex: false },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  const byCategory = new Map<string, typeof content>();
  const uncategorized: typeof content = [];
  for (const item of content) {
    if (!item.category) {
      uncategorized.push(item);
      continue;
    }
    const list = byCategory.get(item.category.name) ?? [];
    list.push(item);
    byCategory.set(item.category.name, list);
  }

  const lines: string[] = [];
  lines.push(`# ${settings.siteName}`);
  lines.push("");
  if (settings.siteDescription) {
    lines.push(`> ${settings.siteDescription}`);
    lines.push("");
  }
  if (settings.llmsTxtIntro) {
    lines.push(settings.llmsTxtIntro);
    lines.push("");
  }

  function renderSection(title: string, items: typeof content) {
    if (items.length === 0) return;
    lines.push(`## ${title}`);
    for (const item of items) {
      const summary = (item.aiSummary || item.excerpt || "").replace(/\s+/g, " ").trim();
      const url = `${settings.siteUrl}/${item.slug}`;
      const rawUrl = `${settings.siteUrl}/${item.slug}/raw`;
      lines.push(`- [${item.title}](${url}) ([markdown](${rawUrl}))${summary ? `: ${summary}` : ""}`);
    }
    lines.push("");
  }

  for (const [name, items] of byCategory) {
    renderSection(name, items);
  }
  renderSection("More", uncategorized);

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
