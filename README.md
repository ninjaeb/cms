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

## Public content API

Besides the CMS's own public pages, a read-only JSON API exposes published
content for other sites to consume headlessly (e.g. gotka.com pulling
CMS-managed copy into its own hand-built page templates):

- `GET /api/public/content?type=PAGE|POST&category=<slug>&tag=<slug>&limit=&cursor=`
  — paginated list of published content (excerpt, not full body).
- `GET /api/public/content/<slug>` — a single published item, including the
  rendered HTML body, AI summary, FAQ items, and SEO fields.

Only `status: PUBLISHED` content is ever returned; drafts and scheduled
content are not reachable through this API. Set `PUBLIC_API_KEY` in `.env`
to require callers to send a matching `x-api-key` header — recommended once
a real external site is wired up, to keep the API off casual scraping.
Responses are cacheable (`Cache-Control: public, max-age=60,
stale-while-revalidate=300`); callers should still cache on their side, since
this endpoint hits the database on every uncached request.

## Deploying on cPanel ("Setup Node.js App")

1. Upload/clone this repository into the app's directory (either via cPanel
   Git Version Control, or by uploading a build).
2. cPanel → **Setup Node.js App** → Create Application:
   - Application root: the directory you cloned into.
   - Application startup file: `server.js` (a small custom server included
     in this repo — cPanel's Node.js hosting runs on Passenger, which expects
     a startup file listening on `process.env.PORT`, rather than invoking
     `next start` directly).
   - Node version: 20+ recommended.
3. Open the app's "Run NPM Install" button (or run it from the provided
   shell) to install dependencies — this also runs `prisma generate` via
   `postinstall`.
4. Create `.env` in the application root from `.env.example`, filling in a
   real `AUTH_SECRET`, `SITE_URL`, and (if wiring up an external site)
   `PUBLIC_API_KEY`. Point `DATABASE_URL` at a path outside the app's
   deployment directory if your workflow re-clones/redeploys the app folder,
   so the SQLite file survives redeploys.
5. Run `npm run db:migrate` and `npm run db:seed` (via the app's shell) to
   create the schema and an initial admin user.
6. Run `npm run build`, then start/restart the app from the cPanel UI.

Note: `@prisma/adapter-better-sqlite3` compiles a native module on install.
If your hosting account's Node.js environment lacks build tools, that step
can fail — in that case, either ask your host to enable them or switch the
Prisma datasource to Postgres (see the SQLite note below) and use a managed
Postgres instance instead.

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
- `src/app/api/public/**`, `src/lib/publicApi.ts` — the public read-only
  content API described below
- `server.js` — custom server entry point for Passenger-based Node hosts
  (e.g. cPanel's "Setup Node.js App")

## Notes

- The SQLite database (`prisma/dev.db`) is local and gitignored. For
  production, either keep SQLite on a persistent volume or swap the Prisma
  datasource/adapter for Postgres.
- `AUTH_SECRET` in `.env` must be replaced with a real random secret outside
  of local development (`openssl rand -base64 32`).
