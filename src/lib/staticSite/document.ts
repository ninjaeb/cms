import { HEAD_ASSETS, SITE_NAME, SITE_ORIGIN, SITE_SCRIPTS, getSiteCss, renderFooter, renderHeader } from "./design";
import { htmlLang, ogLocale, type Locale } from "./i18n";

export type HreflangLinks = { en: string; ms: string; zh: string };

export function renderDocument(opts: {
  title: string;
  description?: string | null;
  canonical: string;
  ogImage?: string | null;
  /** Unprefixed path, e.g. "/about/" or "/blog/my-post/" — see renderHeader. */
  activePath: string;
  locale: Locale;
  bodyMain: string;
  jsonLd?: object[];
  hreflang?: HreflangLinks;
}): string {
  const description = opts.description || "";
  const image = opts.ogImage || `${SITE_ORIGIN}/assets/og-image.png`;
  const hreflangLinks = opts.hreflang
    ? `<link rel="alternate" hreflang="en" href="${opts.hreflang.en}">
<link rel="alternate" hreflang="ms" href="${opts.hreflang.ms}">
<link rel="alternate" hreflang="zh" href="${opts.hreflang.zh}">
<link rel="alternate" hreflang="x-default" href="${opts.hreflang.en}">`
    : "";

  const jsonLdScripts = (opts.jsonLd || [])
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${htmlLang(opts.locale)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${escapeHtml(opts.title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${opts.canonical}">
${hreflangLinks}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:url" content="${opts.canonical}">
<meta property="og:title" content="${escapeAttr(opts.title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="${ogLocale(opts.locale)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(opts.title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${image}">
${HEAD_ASSETS}
${jsonLdScripts}
<style>
${getSiteCss()}
</style>
</head>
<body>
<a class="skip" href="#main" style="position:absolute;left:-9999px">Skip to content</a>
${renderHeader(opts.activePath, opts.locale)}
<main id="main">
${opts.bodyMain}
</main>
${renderFooter(opts.locale)}
${SITE_SCRIPTS}
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
