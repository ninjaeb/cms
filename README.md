# SEO/GEO CMS

A content management system for publishing content that's optimized for both
**traditional SEO** (search engines) and **GEO** (Generative Engine
Optimization — being accurately understood, summarized, and cited by AI
answer engines like ChatGPT, Claude, and Perplexity).

Built with Next.js (App Router), Prisma + SQLite, and Tailwind CSS.

## Features

**Content management**
- Posts and pages with drafts, publishing, categories, and tags
- Markdown body with a live preview-ready editor
- Redirect manager (301/302/307/308) to preserve link equity on URL changes

**Traditional SEO**
- Per-page meta title/description, canonical URL, focus keyword, Open Graph
  / Twitter card images, `noindex`/`nofollow` controls
- Auto-generated `sitemap.xml` and `robots.txt`
- `Article` and `BreadcrumbList` JSON-LD structured data on every page
- A live on-page SEO checklist/score in the editor

**GEO (Generative Engine Optimization)**
- An answer-first "AI summary" field surfaced at the top of every article,
  written to be quotable by AI answer engines
- Key entities/topics, source citations, and a "last fact-checked" freshness
  signal per article
- Per-article FAQ blocks rendered with `FAQPage` JSON-LD
- A clean markdown mirror of every page at `/[slug]/raw` for crawlers that
  prefer plain text over parsed HTML
- `/llms.txt` — a plain-markdown index of all published content, following
  the emerging [llms.txt](https://llmstxt.org) convention
- A robots.txt toggle (Settings → GEO) to allow/deny known AI crawlers
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) as a group
- A live GEO-readiness score in the editor, alongside the SEO score

## Getting started

```bash
npm install
cp .env.example .env      # then edit AUTH_SECRET, SITE_URL, etc.
npm run db:migrate        # creates prisma/dev.db and applies the schema
npm run db:seed           # creates an admin user + a sample article
npm run dev
```

Open http://localhost:3000 for the public site and http://localhost:3000/admin
to sign in (credentials printed by the seed script, default
`admin@example.com` / `changeme123` — change `SEED_ADMIN_PASSWORD` in `.env`
before seeding a real environment).

## Project structure

- `prisma/schema.prisma` — data model (`Content`, `Category`, `Tag`,
  `FaqItem`, `Redirect`, `Setting`, `User`)
- `src/lib/seo.ts` — JSON-LD builders and the SEO/GEO checklist scoring logic
- `src/lib/markdown.ts` — markdown → HTML rendering
- `src/app/admin/**` — the CMS admin (content editor, taxonomy, redirects,
  settings), protected by `src/proxy.ts`
- `src/app/[slug]/**`, `src/app/category/[slug]`, `src/app/tag/[slug]` — the
  public site
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`,
  `src/app/[slug]/raw/route.ts` — SEO/GEO infrastructure

## Notes

- The SQLite database (`prisma/dev.db`) is local and gitignored. For
  production, either keep SQLite on a persistent volume or swap the Prisma
  datasource/adapter for Postgres.
- `AUTH_SECRET` in `.env` must be replaced with a real random secret outside
  of local development (`openssl rand -base64 32`).
