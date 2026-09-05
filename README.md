# SEO/GEO CMS

A content management system for publishing content that's optimized for both
**traditional SEO** (search engines) and **GEO** (Generative Engine
Optimization — being accurately understood, summarized, and cited by AI
answer engines like ChatGPT, Claude, and Perplexity).

Built with Next.js (App Router), Prisma + PostgreSQL, and Tailwind CSS.

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

Requires a running PostgreSQL server (local, Docker, or hosted).

```bash
npm install
cp .env.example .env      # then edit DATABASE_URL, AUTH_SECRET, SITE_URL, etc.

# create the database, e.g.:
#   createdb cms_dev
# or, for a local Postgres role dedicated to this app:
#   createuser cms --pwprompt && createdb cms_dev -O cms

npm run db:migrate        # applies the schema
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

## Deploying to cPanel

This repo includes `.cpanel.yml` for cPanel's Git Version Control → **Deploy
HEAD Commit**, plus `server.js` — a thin custom-server wrapper (see
[Next.js custom server docs](https://nextjs.org/docs/app/guides/custom-server))
that Passenger can `require()` directly, since cPanel's Node.js Selector
doesn't run `npm start`.

Prerequisites, done once in cPanel:

1. **Setup Node.js App** — create (or reuse) the application for this domain.
   Its **Application startup file** must be set to `server.js`. Note the
   Node.js version selected; it's part of the nodevenv path `.cpanel.yml`
   sources (currently `24` — update `.cpanel.yml` if you change it).
2. **PostgreSQL Databases** — create a database and user (cPanel prefixes
   both with your username, e.g. `gotka7_cms`), and note the password.
3. In **Setup Node.js App → Environment Variables**, set (this repo's `.env`
   is git-ignored, so it never reaches the server — these must be set here
   instead):
   - `DATABASE_URL` = `postgresql://gotka7_dbuser:PASSWORD@localhost:5432/gotka7_dbname?schema=public`
   - `AUTH_SECRET` — a real random secret (`openssl rand -base64 32`)
   - `SITE_URL` — the site's public URL, e.g. `https://cms.gotka.com`
   - `NODE_ENV` = `production`
4. The first deploy, run once via the Node.js App's "Run NPM Install" or an
   SSH session with the nodevenv activated: `npx tsx prisma/seed.ts` (or set
   `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars first to avoid the
   default credentials).

After that, every **Deploy HEAD Commit** runs `.cpanel.yml`'s tasks: install
dependencies, apply pending migrations (`prisma migrate deploy`), build, and
restart the app (`touch tmp/restart.txt`, the standard Passenger convention
cPanel's Node.js Selector is built on).

## Notes

- The app connects to Postgres via `@prisma/adapter-pg` using the
  `DATABASE_URL` connection string (see `src/lib/prisma.ts`). Any standard
  Postgres instance works — local, Docker, or a managed provider (Neon,
  Supabase, RDS, etc.).
- `AUTH_SECRET` in `.env` must be replaced with a real random secret outside
  of local development (`openssl rand -base64 32`).
- Every page and route reads live from the database on each request
  (`export const dynamic = "force-dynamic"` cascading from the root
  layout) — nothing is prerendered at build time, so content edits in the
  admin appear immediately and the build never needs a reachable database.
