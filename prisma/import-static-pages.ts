import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../src/lib/prisma";

// One-time import: reads the CURRENTLY LIVE static HTML files for
// public_html's marketing/legal pages and creates matching CMS Content rows
// (type PAGE, raw-HTML body) so they become editable from /admin. This is
// read-only against the static site — it does not write anything back to
// public_html. Re-running it is safe: existing rows (matched by slug) are
// left untouched, not overwritten, so any edits already made in the CMS
// admin are never clobbered.
//
// Usage (on the server, with the nodevenv activated):
//   npx tsx prisma/import-static-pages.ts

const PAGES: { slug: string; isHomepage?: boolean }[] = [
  { slug: "home", isHomepage: true },
  { slug: "about" },
  { slug: "hosting" },
  { slug: "domains" },
  { slug: "web-design" },
  { slug: "app-development" },
  { slug: "digital-namecard" },
  { slug: "contact" },
  { slug: "terms" },
  { slug: "privacy" },
  { slug: "refund-policy" },
  { slug: "acceptable-use" },
  { slug: "sla" },
];

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractMain(html: string): string | null {
  const start = html.indexOf('<main id="main">');
  if (start === -1) return null;
  const end = html.lastIndexOf("</main>");
  if (end === -1 || end < start) return null;
  return html.slice(start + '<main id="main">'.length, end).trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function main() {
  const dir = process.env.STATIC_SITE_DIR?.trim();
  if (!dir) {
    console.error("STATIC_SITE_DIR is not set — nothing to import from. Set it and re-run.");
    process.exit(1);
  }

  for (const page of PAGES) {
    const filePath = path.join(dir, page.isHomepage ? "" : page.slug, "index.html");
    let html: string;
    try {
      html = await fs.readFile(filePath, "utf8");
    } catch {
      console.log(`skip ${page.slug}: ${filePath} not found`);
      continue;
    }

    const existing = await prisma.content.findUnique({
      where: { slug_locale: { slug: page.slug, locale: "en" } },
    });
    if (existing) {
      console.log(`skip ${page.slug}: a Content row with this slug already exists`);
      continue;
    }

    const rawTitle = extractTag(html, /<title>([^<]*)<\/title>/) || page.slug;
    const title = decodeEntities(rawTitle.split(" — ")[0] || rawTitle);
    const description = extractTag(html, /<meta name="description" content="([^"]*)"/);
    const body = extractMain(html);

    if (!body) {
      console.log(`skip ${page.slug}: could not find <main id="main">...</main> in ${filePath}`);
      continue;
    }

    await prisma.content.create({
      data: {
        type: "PAGE",
        status: "PUBLISHED",
        title: page.isHomepage ? "Home" : title,
        slug: page.slug,
        body,
        isHomepage: !!page.isHomepage,
        metaTitle: decodeEntities(rawTitle),
        metaDescription: description ? decodeEntities(description) : null,
        publishedAt: new Date(),
      },
    });
    console.log(`imported ${page.slug} (${body.length} chars)`);
  }

  console.log(
    "\nDone. Review each page in /admin/content, then hit Save on it to sync it back to the " +
      "static site through the CMS for the first time (this overwrites the file with a " +
      "regenerated version — should be equivalent, but confirm it visually before moving on).",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
