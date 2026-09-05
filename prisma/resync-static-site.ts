import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { syncContentToStaticSite, regenerateAllBlogIndexes } from "../src/lib/staticSite/sync";

// Re-renders every published Content row (PAGE and POST, all locales) to the
// linked static site (STATIC_SITE_DIR). Each generated file bakes in a full
// copy of src/lib/staticSite/assets/site.css, so a CSS-only change (e.g. the
// 16.5px -> 18px base font-size fix) does not retroactively affect pages
// that were already synced before the change — run this afterwards to bring
// every already-published page up to date with the current template/CSS.
//
// Usage (on the server, with STATIC_SITE_DIR configured):
//   npx tsx prisma/resync-static-site.ts

async function main() {
  const rows = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, locale: true, type: true },
  });

  console.log(`Resyncing ${rows.length} published content row(s) to the static site...`);

  for (const row of rows) {
    await syncContentToStaticSite(row.id);
    console.log(`Synced: ${row.slug} [${row.locale}] (${row.type})`);
  }

  await regenerateAllBlogIndexes();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
