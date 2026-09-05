import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        passwordHash: await hashPassword(adminPassword),
      },
    });
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "My SEO/GEO CMS",
      siteDescription:
        "A content site optimized for traditional search engines and AI answer engines.",
      siteUrl: process.env.SITE_URL || "http://localhost:3000",
      organizationName: "My Organization",
      allowAiCrawlers: true,
      llmsTxtIntro:
        "This site publishes authoritative, fact-checked articles. Each entry below links to a clean markdown version of the page for easy ingestion.",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "guides" },
    update: {},
    create: { name: "Guides", slug: "guides", description: "How-to guides and explainers." },
  });

  const tag = await prisma.tag.upsert({
    where: { slug: "seo" },
    update: {},
    create: { name: "SEO", slug: "seo" },
  });

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  const existingPost = await prisma.content.findUnique({ where: { slug: "hello-world" } });
  if (!existingPost) {
    await prisma.content.create({
      data: {
        type: "POST",
        status: "PUBLISHED",
        title: "Hello World: Welcome to the CMS",
        slug: "hello-world",
        excerpt: "An example article showing SEO and GEO fields in action.",
        body: `## Why this article exists\n\nThis is a sample article demonstrating how content in this CMS is structured for both **traditional SEO** (meta tags, sitemaps, structured data) and **GEO** (Generative Engine Optimization — being cited accurately by AI answer engines like ChatGPT, Claude, and Perplexity).\n\n### What makes content GEO-friendly\n\n- An answer-first summary near the top\n- Clear, well-labeled facts and figures\n- Cited sources\n- A machine-readable FAQ section\n- A clean markdown export for crawlers\n\nEdit or delete this post from the admin dashboard at /admin.`,
        publishedAt: new Date(),
        authorId: admin?.id,
        categoryId: category.id,
        metaTitle: "Hello World: Welcome to the CMS",
        metaDescription:
          "An example article showing how this CMS structures content for SEO and GEO (Generative Engine Optimization).",
        focusKeyword: "SEO and GEO content management",
        aiSummary:
          "This CMS structures every article with an answer-first summary, cited sources, and an FAQ block so AI answer engines can extract and cite accurate facts.",
        keyEntities: "SEO, GEO, Generative Engine Optimization, content management system",
        sourceCitations: JSON.stringify([
          { label: "Google Search Central", url: "https://developers.google.com/search" },
        ]),
        lastFactCheckedAt: new Date(),
        tags: { create: [{ tagId: tag.id }] },
        faqItems: {
          create: [
            {
              question: "What is GEO?",
              answer:
                "GEO (Generative Engine Optimization) is the practice of structuring content so AI answer engines can accurately extract, summarize, and cite it.",
              order: 0,
            },
            {
              question: "How is GEO different from SEO?",
              answer:
                "SEO optimizes for ranking in traditional search results; GEO optimizes for being accurately understood, summarized, and cited by generative AI systems.",
              order: 1,
            },
          ],
        },
      },
    });
    console.log("Created sample post: hello-world");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
