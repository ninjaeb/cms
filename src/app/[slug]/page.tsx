import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { markdownToHtml } from "@/lib/markdown";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  parseCitations,
  parseEntities,
} from "@/lib/seo";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";

async function getContent(slug: string) {
  return prisma.content.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
      faqItems: { orderBy: { order: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [content, settings] = await Promise.all([getContent(slug), getSettings()]);
  if (!content || content.status !== "PUBLISHED") return {};

  const title = content.metaTitle || content.title;
  const description = content.metaDescription || content.excerpt || undefined;
  const image = content.ogImage || content.featuredImage || settings.defaultOgImage || undefined;
  const url = `${settings.siteUrl}/${content.slug}`;

  return {
    title,
    description,
    alternates: { canonical: content.canonicalUrl || url },
    robots: {
      index: !content.noindex,
      follow: !content.nofollow,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: image ? [{ url: image }] : undefined,
      publishedTime: (content.publishedAt || content.createdAt).toISOString(),
      modifiedTime: content.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
      site: settings.twitterHandle || undefined,
    },
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, settings] = await Promise.all([getContent(slug), getSettings()]);

  if (!content || content.status !== "PUBLISHED") notFound();

  const html = await markdownToHtml(content.body);
  const citations = parseCitations(content.sourceCitations);
  const entities = parseEntities(content.keyEntities);

  const articleJsonLd = buildArticleJsonLd(content, settings.siteUrl, settings.siteName);
  const faqJsonLd = buildFaqJsonLd(content.faqItems);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: settings.siteUrl },
    ...(content.category
      ? [{ name: content.category.name, url: `${settings.siteUrl}/category/${content.category.slug}` }]
      : []),
    { name: content.title, url: `${settings.siteUrl}/${content.slug}` },
  ]);

  return (
    <>
      <SiteHeader siteName={settings.siteName} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {content.category && (
            <>
              {" / "}
              <Link href={`/category/${content.category.slug}`} className="hover:underline">
                {content.category.name}
              </Link>
            </>
          )}
        </nav>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">{content.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              {content.author && <span>By {content.author.name}</span>}
              {content.publishedAt && (
                <time dateTime={content.publishedAt.toISOString()}>
                  {content.author && "· "}
                  {content.publishedAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              {content.lastFactCheckedAt && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  Facts verified {content.lastFactCheckedAt.toLocaleDateString()}
                </span>
              )}
            </div>
          </header>

          {content.aiSummary && (
            <aside
              aria-label="Quick answer"
              className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Quick answer
              </p>
              <p className="text-neutral-800">{content.aiSummary}</p>
            </aside>
          )}

          <div
            className="prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-neutral-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {entities.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {entities.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                >
                  {e}
                </span>
              ))}
            </div>
          )}

          {content.faqItems.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-2xl font-semibold text-neutral-900">
                Frequently asked questions
              </h2>
              <dl className="space-y-6">
                {content.faqItems.map((f) => (
                  <div key={f.id}>
                    <dt className="font-medium text-neutral-900">{f.question}</dt>
                    <dd className="mt-1 text-neutral-600">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {citations.length > 0 && (
            <section className="mt-12 border-t border-neutral-200 pt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Sources
              </h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600">
                {citations.map((c) => (
                  <li key={c.url}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {content.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <p className="mt-8 text-xs text-neutral-400">
            <a href={`/${content.slug}/raw`} className="hover:underline">
              Plain-text/Markdown version for AI crawlers
            </a>
          </p>
        </article>
      </main>
      <SiteFooter siteName={settings.siteName} />
    </>
  );
}
