# SEO/GEO Scanner

An admin tool that scans a `public_html`-style directory of static HTML files
and scores each page for both **traditional SEO** (search engines) and
**GEO** (Generative Engine Optimization — being accurately understood,
summarized, and cited by AI answer engines like ChatGPT, Claude, and
Perplexity), then generates rule-based and AI-written recommendations.

This does not manage or publish content — it reads and audits HTML that
already exists on disk.

Built with Next.js (App Router), Prisma + PostgreSQL, and Tailwind CSS.

## Features

- **Scan** a configured root directory for `*.html`/`*.htm` files
  (`src/lib/htmlScan.ts`), extracting title/meta description/canonical,
  heading structure, image alt-text coverage, JSON-LD structured data
  (`Article`/`BlogPosting`, `FAQPage`, `BreadcrumbList`), and freshness/
  citation/summary heuristics.
- **Score** each page against an SEO checklist and a GEO checklist
  (`src/lib/seo.ts`), each rendered as a pass/fail list with a percentage
  score.
- **Recommend** fixes for failing checks: the checklist hints are rule-based
  and instant; a per-page "Generate recommendation" button additionally
  calls Gemini for specific, page-referencing suggestions
  (`src/lib/aiRecommend.ts`).
- Scan history is persisted (`ScanRun`/`PageScan` models) so past scans stay
  browsable.

## Getting started

Requires a running PostgreSQL server (local, Docker, or hosted).

```bash
npm install
cp .env.example .env      # then edit DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY

# create the database, e.g.:
#   createdb cms_dev

npm run db:migrate        # applies the schema
npm run db:seed           # creates an admin user
npm run dev
```

Open http://localhost:3000/admin to sign in (credentials printed by the seed
script, default `admin@example.com` / `changeme123` — change
`SEED_ADMIN_PASSWORD` in `.env` before seeding a real environment). Then in
**Settings**, set the root directory to scan (e.g. `/home/youruser/public_html`)
and run a scan from the **Scan** page.

AI-generated recommendations require `GEMINI_API_KEY` to be set; without
it, the rule-based checklist still works, but the "Generate recommendation"
button will fail.

## Project structure

- `prisma/schema.prisma` — data model (`User`, `Setting`, `ScanRun`,
  `PageScan`)
- `src/lib/htmlScan.ts` — recursively finds and parses HTML files into a
  normalized signals shape
- `src/lib/seo.ts` — the SEO/GEO checklist scoring logic
  (`computeChecklistFromPageSignals`)
- `src/lib/aiRecommend.ts` — calls Gemini for page-specific recommendations
- `src/app/admin/**` — the admin UI (dashboard, scan runs, settings),
  protected by `src/proxy.ts`
- `src/app/api/scan/**` — triggers scans, lists runs, generates
  recommendations

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
   - `GEMINI_API_KEY` — required for AI-generated recommendations
   - `NODE_ENV` = `production`
4. The first deploy, run once via the Node.js App's "Run NPM Install" or an
   SSH session with the nodevenv activated: `npx tsx prisma/seed.ts` (or set
   `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars first to avoid the
   default credentials).
5. In the admin's **Settings** page, set the root directory to scan — e.g.
   the account's actual `public_html` (`/home/gotka7/public_html`).

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
- The scan root directory must be readable by the Node process running this
  app (same filesystem, correct permissions) — it is not fetched over HTTP.
