import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCitations, parseEntities } from "@/lib/seo";

// A clean, dependency-free markdown mirror of each page for AI crawlers and
// retrieval pipelines that prefer plain text over parsing rendered HTML.
// Content is managed live in the admin — never prerender this at build time.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Not locale-aware: this route predates multi-language content and picks
  // whichever translation sorts first ("en") when more than one exists.
  const content = await prisma.content.findFirst({
    where: { slug },
    orderBy: { locale: "asc" },
    include: { faqItems: { orderBy: { order: "asc" } } },
  });

  if (!content || content.status !== "PUBLISHED" || content.noindex) {
    return new NextResponse("Not found", { status: 404 });
  }

  const lines: string[] = [`# ${content.title}`, ""];

  if (content.aiSummary) {
    lines.push("> " + content.aiSummary, "");
  }

  lines.push(content.body, "");

  const entities = parseEntities(content.keyEntities);
  if (entities.length > 0) {
    lines.push("## Topics", entities.map((e) => `- ${e}`).join("\n"), "");
  }

  if (content.faqItems.length > 0) {
    lines.push("## FAQ");
    for (const f of content.faqItems) {
      lines.push(`### ${f.question}`, f.answer, "");
    }
  }

  const citations = parseCitations(content.sourceCitations);
  if (citations.length > 0) {
    lines.push("## Sources", citations.map((c) => `- [${c.label}](${c.url})`).join("\n"), "");
  }

  if (content.lastFactCheckedAt) {
    lines.push(`_Facts last verified: ${content.lastFactCheckedAt.toISOString().slice(0, 10)}_`);
  }

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
