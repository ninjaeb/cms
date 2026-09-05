// Locale support for the static-site sync (see sync.ts, renderPage.ts,
// renderBlogPost.ts, renderBlogIndex.ts). "en" pages live at the site root
// (no prefix); "ms" and "zh" pages live under /ms/ and /zh/ — matching the
// original hand-built site's convention (e.g. /ms/about/, /zh/about/).

export const LOCALES = ["en", "ms", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The DB stores locale as a free-form string; fall back to "en" for any unrecognized value. */
export function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : "en";
}

export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

/** BCP-47 tag for <html lang> and og:locale. */
export function htmlLang(locale: Locale): string {
  return locale === "en" ? "en" : locale;
}
export function ogLocale(locale: Locale): string {
  return { en: "en_MY", ms: "ms_MY", zh: "zh_CN" }[locale];
}

/** Intl date-formatting locale per site language. */
export function dateLocale(locale: Locale): string {
  return { en: "en-GB", ms: "ms-MY", zh: "zh-CN" }[locale];
}

export const LANG_LABEL: Record<Locale, string> = { en: "EN", ms: "BM", zh: "中文" };

// Services submenu, in nav order. Reused verbatim from the site's own
// hand-built /ms/ and /zh/ pages so nav terminology stays consistent.
export const SERVICES_NAV: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/hosting/", label: "Cloud Hosting" },
    { href: "/domains/", label: "Domains" },
    { href: "/web-design/", label: "Web Design" },
    { href: "/app-development/", label: "App & System Development" },
    { href: "/digital-namecard/", label: "Digital Name Card" },
  ],
  ms: [
    { href: "/hosting/", label: "Pengehosan Awan" },
    { href: "/domains/", label: "Domain" },
    { href: "/web-design/", label: "Reka Bentuk Web" },
    { href: "/app-development/", label: "Pembangunan Aplikasi & Sistem" },
    { href: "/digital-namecard/", label: "Kad Nama Digital" },
  ],
  zh: [
    { href: "/hosting/", label: "云主机" },
    { href: "/domains/", label: "域名" },
    { href: "/web-design/", label: "网站设计" },
    { href: "/app-development/", label: "应用与系统开发" },
    { href: "/digital-namecard/", label: "数字名片" },
  ],
};

// UI strings for the chrome the static-site renderers generate around
// CMS content (nav, blog scaffolding). Page/post body content itself comes
// from the Content row in whichever language it was written in — this is
// only the surrounding template text.
export const UI = {
  en: {
    home: "Home",
    services: "Services",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    signIn: "Sign in",
    getStarted: "Get started",
    blogTitle: "Blog",
    blogHeading: "Insights & updates",
    blogLead:
      "Guides and news from the Gotka Technologies team on hosting, domains, web design and running an online business.",
    noPosts: "No posts published yet — check back soon.",
    quickAnswer: "Quick answer",
    faqHeading: "Frequently asked questions",
    sourcesHeading: "Sources",
    factsVerified: "Facts last verified",
  },
  ms: {
    home: "Utama",
    services: "Perkhidmatan",
    about: "Tentang Kami",
    blog: "Blog",
    contact: "Hubungi",
    signIn: "Log masuk",
    getStarted: "Mulakan",
    blogTitle: "Blog",
    blogHeading: "Wawasan & kemas kini",
    blogLead:
      "Panduan dan berita daripada pasukan Gotka Technologies mengenai hosting, domain, reka bentuk web dan menjalankan perniagaan dalam talian.",
    noPosts: "Belum ada catatan diterbitkan — sila semak semula tidak lama lagi.",
    quickAnswer: "Jawapan pantas",
    faqHeading: "Soalan lazim",
    sourcesHeading: "Sumber",
    factsVerified: "Fakta terakhir disahkan pada",
  },
  zh: {
    home: "首页",
    services: "服务",
    about: "关于我们",
    blog: "博客",
    contact: "联系我们",
    signIn: "登录",
    getStarted: "立即开始",
    blogTitle: "博客",
    blogHeading: "洞察与更新",
    blogLead: "Gotka Technologies 团队分享的主机、域名、网页设计与在线业务经营相关的指南与资讯。",
    noPosts: "暂无已发布的文章，请稍后再查看。",
    quickAnswer: "快速解答",
    faqHeading: "常见问题",
    sourcesHeading: "来源",
    factsVerified: "事实最后核实于",
  },
} as const satisfies Record<Locale, Record<string, string>>;
