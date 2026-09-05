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
- `src/lib/staticSite/**` — renders and syncs content to a linked static
  site's document root (see "Managing a linked static site" below);
  `prisma/import-static-pages.ts` brings that site's existing pages under
  CMS management

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
   - `STATIC_SITE_DIR` — optional; set this to sync content to a linked
     static site's document root (e.g. `/home/gotka7/public_html`) — see
     "Managing a linked static site" below
4. The first deploy, run once via the Node.js App's "Run NPM Install" or an
   SSH session with the nodevenv activated: `npx tsx prisma/seed.ts` (or set
   `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars first to avoid the
   default credentials).

After that, every **Deploy HEAD Commit** runs `.cpanel.yml`'s tasks: install
dependencies, apply pending migrations (`prisma migrate deploy`), build, and
restart the app (`touch tmp/restart.txt`, the standard Passenger convention
cPanel's Node.js Selector is built on).

## Managing a linked static site

If a separate static site (e.g. a marketing site built as plain HTML) lives
on the same server, this CMS can manage its content directly: publishing in
`/admin` writes the corresponding static HTML file straight into that site's
document root, matching its existing design exactly.

- **Blog posts** (`type: POST`) sync to `<site>/blog/<slug>/index.html` using
  a shared blog template (header/footer/CSS copied from the static site) —
  written from the post's Markdown body, so the normal admin editor and GEO
  fields (AI summary, FAQ, citations) apply as usual. `<site>/blog/index.html`
  (a listing of all published posts) regenerates automatically on every
  publish/unpublish/delete.
- **Pages** (`type: PAGE`) sync to `<site>/<slug>/index.html` (or `<site>/`
  itself, if "This is the homepage" is checked). A page's **Body** field is
  **raw HTML**, not Markdown — it's inserted directly into the static page's
  `<main>`, so hand-built layouts (pricing tables, grids, forms) are
  reproduced exactly rather than flattened through a generic content
  pipeline. The admin's Body field switches to "Raw HTML" and shows this
  hint automatically when Type is set to Page.
- The site's shared design system (colors, fonts, header, nav, footer) lives
  in `src/lib/staticSite/design.ts` and `src/lib/staticSite/assets/site.css`
  — update these if the static site's design changes.
- The generated header adds a **Blog** nav link that the original static
  pages don't have. It only appears on pages regenerated through the CMS —
  see the import step below to bring existing pages under CMS management
  (which also regenerates them with this link included).

**Setup:**
1. Set `STATIC_SITE_DIR` to the static site's absolute document root (e.g.
   `/home/youruser/public_html`) — in `.env` locally, or as a cPanel Node.js
   App environment variable in production. Sync is a no-op whenever this is
   unset, so it's safe to leave off entirely if there's no linked site.
2. To bring **existing** static pages under CMS management, run (once, with
   `STATIC_SITE_DIR` set) `npx tsx prisma/import-static-pages.ts` — it reads
   the current live HTML files (a hardcoded list of slugs in that script;
   edit it to match your site's actual pages) and creates matching `PAGE`
   Content rows. It's read-only against the static site and safe to re-run
   (it skips any slug that already has a Content row, so it never clobbers
   edits already made in the admin).
3. Review each imported page in `/admin/content`, then hit **Save** — this
   triggers its first sync back through the CMS's renderer. Confirm the
   result looks right before moving on to the next one (the render should be
   visually equivalent to the original, but always verify).

**Limitations:** only content managed this way is CMS-controlled — anything
else on the static site (other languages, the contact form's PHP handler,
etc.) stays exactly as hand-built, untouched by the CMS.

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
