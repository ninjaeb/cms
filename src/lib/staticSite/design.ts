import fs from "fs";
import path from "path";

// The gotka.com static site's shared design system, extracted verbatim from
// its own pages so CMS-generated pages (blog posts and CMS-managed marketing
// pages) are visually indistinguishable from the hand-built ones.

let cachedCss: string | null = null;
export function getSiteCss(): string {
  if (cachedCss) return cachedCss;
  cachedCss = fs.readFileSync(path.join(process.cwd(), "src/lib/staticSite/assets/site.css"), "utf8");
  return cachedCss;
}

export const SITE_NAME = "Gotka Technologies";
export const SITE_ORIGIN = "https://gotka.com";

// The Organization schema present in every original page's <head> — a
// site-wide fact, not per-page content, so every CMS-generated page (both
// PAGE and POST) includes it too rather than relying on each page's body.
export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/assets/icon-512.png`,
  email: "hello@gotka.com",
  foundingDate: "2004",
  sameAs: [
    "https://www.facebook.com/people/Gotka-Technologies/61564390635502/",
    "https://www.linkedin.com/company/gotka-technologies/",
  ],
  contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: "support@gotka.com" }],
};

// The homepage's richer variant (from the original site's <head>).
export const HOMEPAGE_ORGANIZATION_JSON_LD = {
  ...ORGANIZATION_JSON_LD,
  alternateName: "Gotka",
  description:
    "Gotka Technologies is a Malaysian web hosting and digital services company, operating since 2004, offering cloud web hosting, domain registration, VPS, web design, app and system development, and digital business cards.",
  areaServed: { "@type": "Country", name: "Malaysia" },
  knowsAbout: [
    "Web hosting",
    "Cloud hosting",
    "Domain name registration",
    "VPS hosting",
    "Web design",
    "App development",
    "Digital business cards",
  ],
};

// Non-per-page <head> boilerplate: icon, fonts, theme-color, theme-init script.
// Icon paths are absolute (the original site uses relative paths here, which
// only happen to work on top-level pages — made absolute so this is correct
// at any nesting depth, e.g. /blog/<slug>/).
export const HEAD_ASSETS = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230E1B28'/%3E%3Cpath d='M40 20 L23 20 Q14 20 14 29 L14 39 Q14 48 23 48 L28 48 Q37 48 37 39 L37 33 L26 33' fill='none' stroke='white' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='47' cy='17' r='5' fill='%232EC27E'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F1F4F2">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0C151E">
<link rel="icon" href="${SITE_ORIGIN}/assets/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="${SITE_ORIGIN}/assets/apple-touch-icon.png">
<script>(function(){try{if(localStorage.getItem("gotka-theme-v2")==="dark"){document.documentElement.setAttribute("data-theme","dark");}}catch(e){}})();</script>`;

// The two shared behavior scripts, verbatim from the static site (mobile nav,
// theme toggle, services dropdown, scroll reveals, domain-search TLD chips,
// mailto contact fallback, and de-obfuscation of "obf-email" links).
export const SITE_SCRIPTS = `<script>
// GOTKA TECHNOLOGIES — shared behaviour
(function () {
  "use strict";

  // Mobile navigation
  var hdr = document.querySelector(".hdr");
  var burger = document.getElementById("burger");
  if (burger && hdr) {
    burger.addEventListener("click", function () {
      var open = hdr.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        hdr.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }


  // Theme toggle (light default, persisted where storage is available)
  var tgl = document.getElementById("theme-toggle");
  if (tgl) {
    tgl.addEventListener("click", function () {
      var root = document.documentElement;
      var toDark = root.getAttribute("data-theme") !== "dark";
      if (toDark) { root.setAttribute("data-theme", "dark"); }
      else { root.removeAttribute("data-theme"); }
      try { localStorage.setItem("gotka-theme-v2", toDark ? "dark" : "light"); } catch (e) {}
    });
  }

  // Services nav dropdown: close on outside click, Escape, or link click
  var navDrop = document.querySelector(".nav-drop");
  if (navDrop) {
    document.addEventListener("click", function (ev) {
      if (!navDrop.contains(ev.target)) navDrop.removeAttribute("open");
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") navDrop.removeAttribute("open");
    });
    navDrop.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navDrop.removeAttribute("open"); });
    });
  }

  // Scroll reveals
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
  }

  // Domain search: TLD chips append the extension to the query field
  document.querySelectorAll("[data-tld]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var form = chip.closest("section, .dband") || document;
      var input = form.querySelector(".dq");
      if (!input) return;
      var base = input.value.replace(/\\.[a-z.]*$/i, "").trim() || "yourbusiness";
      input.value = base + chip.getAttribute("data-tld");
      input.focus();
    });
  });

  // Contact form: compose an email in the visitor's mail app
  var cform = document.getElementById("contact-form");
  if (cform) {
    cform.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var subject = "[" + v("cf-topic") + "] Enquiry from " + v("cf-name");
      var body =
        "Name: " + v("cf-name") +
        "\\nEmail: " + v("cf-email") +
        "\\nTopic: " + v("cf-topic") +
        "\\n\\n" + v("cf-msg");
      window.location.href =
        "mailto:hello@gotka.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = document.getElementById("cf-note");
      if (note) note.textContent = cform.getAttribute("data-sent") || "Your mail app should open with the message ready to send. You can also write to hello@gotka.com directly.";
    });
  }
})();
</script>

<script>
// Reconstruct email links client-side to deter address-harvesting bots.
(function () {
  document.querySelectorAll(".obf-email").forEach(function (el) {
    var u = el.getAttribute("data-u");
    var d = el.getAttribute("data-d");
    if (!u || !d) return;
    var addr = u + "@" + d;
    var q = el.getAttribute("data-q");
    el.setAttribute("href", "mailto:" + addr + (q ? "?" + q : ""));

    var target = el.querySelector("p");
    if (target) {
      target.textContent = addr;
    } else if (el.children.length === 0) {
      var text = el.textContent;
      if (text.trim() === "Show email") {
        el.textContent = addr;
      } else if (/\\[at\\]/.test(text)) {
        el.textContent = text.replace(u + " [at] " + d, addr);
      }
    }
    el.removeAttribute("onclick");
    el.removeAttribute("rel");
  });
})();
</script>`;

const SERVICES_LINKS = [
  { href: "/hosting/", label: "Cloud Hosting" },
  { href: "/domains/", label: "Domains" },
  { href: "/web-design/", label: "Web Design" },
  { href: "/app-development/", label: "App & System Development" },
  { href: "/digital-namecard/", label: "Digital Name Card" },
];

function isServicesActive(activePath: string) {
  return SERVICES_LINKS.some((l) => l.href === activePath);
}

/**
 * Renders the shared site header/nav, verbatim to the original site's markup
 * except for: which link is marked active, and a "Blog" link added to the
 * primary nav (the original static pages don't have this yet — add it to
 * their nav manually, see README).
 */
export function renderHeader(activePath: string): string {
  const servicesOpen = isServicesActive(activePath);
  const servicesLinks = SERVICES_LINKS.map(
    (l) => `          <a ${l.href === activePath ? 'class="active" ' : " "}href="${l.href}">${l.label}</a>`,
  ).join("\n");

  return `<header class="hdr">
  <div class="wrap hdr-in">
    <a class="brand" href="/" aria-label="${SITE_NAME}">
      <svg class="b-badge" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="28" fill="#0E1B28"/><g transform="translate(28 29) scale(0.62)"><path d="M68 12 L32 12 Q12 12 12 32 L12 68 Q12 88 32 88 L48 88 Q68 88 68 68 L68 52 L42 52" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></g><circle cx="92" cy="28" r="8" fill="#2EC27E"/></svg>
      <span class="b-txt">
        <svg class="b-word" viewBox="0 0 464 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M68 12 L32 12 Q12 12 12 32 L12 68 Q12 88 32 88 L48 88 Q68 88 68 68 L68 52 L42 52"/><path transform="translate(96 0)" d="M32 12 L48 12 Q68 12 68 32 L68 68 Q68 88 48 88 L32 88 Q12 88 12 68 L12 32 Q12 12 32 12 Z"/><path transform="translate(192 0)" d="M12 12 L68 12 M40 12 L40 88"/><path transform="translate(288 0)" d="M16 12 L16 88 M64 12 L16 60 M34 44 L66 88"/><path transform="translate(384 0)" d="M12 88 L12 48 Q12 12 40 12 Q68 12 68 48 L68 88 M12 60 L68 60"/></g></svg>
        <span class="brand-sub">TECHNOLOGIES</span>
      </span>
    </a>
    <div class="nav-mobile-panel">
    <nav class="nav" id="nav" aria-label="Main">
      <a ${activePath === "/" ? 'class="active" ' : " "}href="/">Home</a>
      <details class="nav-drop"${servicesOpen ? " open" : ""}>
        <summary class="${servicesOpen ? "active" : ""}">Services<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
        <div class="nav-drop-panel">
${servicesLinks}
        </div>
      </details>
      <a ${activePath === "/about/" ? 'class="active" ' : " "}href="/about/">About</a>
      <a ${activePath.startsWith("/blog") ? 'class="active" ' : " "}href="/blog/">Blog</a>
      <a ${activePath === "/contact/" ? 'class="active" ' : " "}href="/contact/">Contact</a>
    </nav>
    <div class="hdr-cta">
      <a class="signin" href="https://gotka.com/clients/login">Sign in</a>
      <a class="btn btn-sm" href="/hosting/">Get started</a>
    </div>
    </div>
    <div class="lang"><span class="on" aria-current="page">EN</span><a href="/ms/">BM</a><a href="/zh/">中文</a></div>
    <button class="tgl" id="theme-toggle" type="button" aria-label="Toggle dark mode">
      <svg class="i-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></svg>
      <svg class="i-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 14.5A8.6 8.6 0 0 1 9.5 3.4a8.6 8.6 0 1 0 11.1 11.1z"/></svg>
    </button>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

/** Verbatim from the static site — identical on every page. */
export function renderFooter(): string {
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="/" aria-label="${SITE_NAME}">
          <svg class="b-badge" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="28" fill="#0D5C63"/><g transform="translate(28 29) scale(0.62)"><path d="M68 12 L32 12 Q12 12 12 32 L12 68 Q12 88 32 88 L48 88 Q68 88 68 68 L68 52 L42 52" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></g><circle cx="92" cy="28" r="8" fill="#2EC27E"/></svg>
          <span class="b-txt">
            <svg class="b-word" viewBox="0 0 464 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M68 12 L32 12 Q12 12 12 32 L12 68 Q12 88 32 88 L48 88 Q68 88 68 68 L68 52 L42 52"/><path transform="translate(96 0)" d="M32 12 L48 12 Q68 12 68 32 L68 68 Q68 88 48 88 L32 88 Q12 88 12 68 L12 32 Q12 12 32 12 Z"/><path transform="translate(192 0)" d="M12 12 L68 12 M40 12 L40 88"/><path transform="translate(288 0)" d="M16 12 L16 88 M64 12 L16 60 M34 44 L66 88"/><path transform="translate(384 0)" d="M12 88 L12 48 Q12 12 40 12 Q68 12 68 48 L68 88 M12 60 L68 60"/></g></svg>
            <span class="brand-sub">TECHNOLOGIES</span>
          </span>
        </a>
        <p>We bring your business online — customisable cloud hosting, domain names and web design for growing businesses.</p>
        <div class="socials">
          <a href="https://www.facebook.com/people/Gotka-Technologies/61564390635502/" aria-label="Gotka Technologies on Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.7-1.6h1.5V3.2C16.4 3.1 15.4 3 14.3 3c-2.4 0-4 1.4-4 4.2v2.6H7.5V13h2.8v8h3.2z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/gotka-technologies/" aria-label="Gotka Technologies on LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.8H3.6V21h2.9V8.8zM5 7.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM21 13.5c0-3.2-1.7-4.9-4-4.9-1.9 0-2.7 1-3.2 1.8V8.8H11V21h2.9v-6.5c0-1.6.6-2.7 2.1-2.7 1.4 0 2 1 2 2.7V21H21v-7.5z"/></svg>
          </a>
        </div>
      </div>
      <div>
        <h4>Services</h4>
        <ul>
          <li><a href="/hosting/">Business Cloud Hosting</a></li>
          <li><a href="/domains/">Domain Registration</a></li>
          <li><a href="/web-design/">Web Design &amp; Development</a></li>
          <li><a href="/app-development/">App &amp; System Development</a></li>
          <li><a href="/digital-namecard/">Digital Name Card</a></li>
        </ul>
      </div>
      <div>
        <h4>Clients Area</h4>
        <ul>
          <li><a href="https://gotka.com/clients/clientarea.php?action=services">My Services</a></li>
          <li><a href="https://gotka.com/clients/clientarea.php?action=domains">My Domains</a></li>
          <li><a href="https://gotka.com/clients/submitticket.php">Support Center</a></li>
          <li><a href="https://gotka.com/clients/knowledgebase">Knowledgebase</a></li>
          <li><a href="https://gotka.com/clients/announcements">Announcements</a></li>
          <li><a href="https://gotka.com/clients/affiliates.php">Affiliates</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="/terms/">Terms of Service</a></li>
          <li><a href="/acceptable-use/">Acceptable Use Policy</a></li>
          <li><a href="/privacy/">Privacy Policy</a></li>
          <li><a href="/refund-policy/">Refund Policy</a></li>
          <li><a href="/sla/">Uptime SLA</a></li>
        </ul>
      </div>
      <div>
        <h4>Talk to us</h4>
        <ul>
          <li><a href="#" class="obf-email" data-u="hello" data-d="gotka.com" onclick="return false" rel="nofollow">hello [at] gotka.com</a></li>
          <li><a href="#" class="obf-email" data-u="support" data-d="gotka.com" onclick="return false" rel="nofollow">support [at] gotka.com</a></li>
          <li><a href="https://gotka.com/clients/submitticket.php">Open a support ticket</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bar">
      <span>© 2004 – 2026 Gotka Technologies. All rights reserved.</span>
      <span class="up-badge"><i aria-hidden="true"></i>99.9% uptime guarantee</span>
    </div>
  </div>
</footer>`;
}
