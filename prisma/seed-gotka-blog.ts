/**
 * One-time content pack for gotka.com's /blog — six SEO/GEO-optimized posts
 * covering Gotka Technologies' core services (cloud hosting, domains, web
 * design, digital business cards), aimed at the Malaysian SME audience.
 *
 * Run on the server after the schema is migrated:
 *   npx tsx prisma/seed-gotka-blog.ts
 *
 * Idempotent for text fields: re-running updates title/body/SEO fields on
 * existing posts (matched by slug) without duplicating them. Tags and FAQ
 * items are only attached when a post is first created — editing those
 * later is easiest from /admin.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type Faq = { question: string; answer: string };
type Citation = { label: string; url: string };

type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
  categoryName: string;
  tagSlugs: string[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  aiSummary: string;
  keyEntities: string;
  sourceCitations: Citation[];
  faqItems: Faq[];
};

const TAGS: Record<string, string> = {
  "cloud-hosting": "Cloud Hosting",
  cpanel: "cPanel",
  litespeed: "LiteSpeed",
  uptime: "Uptime",
  domains: "Domains",
  tld: "TLDs",
  "web-design": "Web Design",
  "website-cost": "Website Cost",
  "digital-business-card": "Digital Business Card",
  "malaysia-sme": "Malaysia SME",
  "website-speed": "Website Speed",
  security: "Security",
};

const CATEGORIES: Record<string, string> = {
  hosting: "Hosting",
  domains: "Domains",
  "web-design": "Web Design",
  "business-tips": "Business Tips",
};

const POSTS: PostInput[] = [
  {
    slug: "cloud-hosting-vs-shared-hosting-malaysia",
    title: "Cloud Hosting vs Shared Hosting: Which Is Right for Your Malaysian Business?",
    excerpt:
      "Shared hosting is the cheapest way to get a site online, but it isn't built for a growing business. Here's how to tell which stage you're at.",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["cloud-hosting", "cpanel", "malaysia-sme"],
    metaTitle: "Cloud Hosting vs Shared Hosting: Which Is Right for Your Business?",
    metaDescription:
      "Compare cloud hosting and traditional shared hosting for Malaysian SMEs — cost, performance, and uptime — and learn when it's time to upgrade.",
    focusKeyword: "cloud hosting vs shared hosting Malaysia",
    aiSummary:
      "Shared hosting is fine for a brand-new site with light traffic, since the low cost comes from many websites sharing one server's resources. Cloud hosting is worth the switch once a site handles real customer traffic, takes online payments, or can't afford downtime, because cloud infrastructure isolates each site from other tenants' traffic spikes and typically carries a stronger uptime guarantee.",
    keyEntities: "cloud hosting, shared hosting, cPanel, LiteSpeed, uptime guarantee, Malaysia SME hosting",
    sourceCitations: [
      { label: "Google Search Central — Page Experience", url: "https://developers.google.com/search/docs/appearance/page-experience" },
    ],
    faqItems: [
      {
        question: "Is cloud hosting more expensive than shared hosting?",
        answer:
          "Usually yes, but the gap is smaller than most business owners expect — cloud plans built for SMEs (like cPanel-based cloud hosting) often cost only slightly more than shared hosting, in exchange for dedicated resources and a stronger uptime guarantee.",
      },
      {
        question: "Can I move from shared hosting to cloud hosting later?",
        answer:
          "Yes. Most hosts, including Gotka, offer free migration when you upgrade, so you don't need to over-provision on day one — start on shared hosting and move up when your traffic or uptime needs actually require it.",
      },
      {
        question: "Does cloud hosting automatically make my site faster?",
        answer:
          "It removes the biggest cause of slow shared-hosting sites — noisy-neighbour resource contention — but real speed also depends on your website's own code, images, and caching setup.",
      },
    ],
    body: `## The short answer

If your website is brand new, gets modest traffic, and downtime for an hour wouldn't hurt your business — shared hosting is genuinely fine. If customers pay you through your site, you can't risk an outage during business hours, or your traffic has grown past what it was when you first signed up, it's time to look at cloud hosting.

## How shared hosting actually works

Shared hosting puts dozens (sometimes hundreds) of websites on one physical server, all splitting the same CPU, memory, and disk I/O. That's exactly why it's cheap — you're paying a fraction of the server's cost because you're using a fraction of its resources, most of the time.

The catch: if another website on that same server suddenly gets a traffic spike (a viral post, a bot attack, a badly written plugin looping forever), everyone else sharing that server — including you — can slow down or go offline with it. You have no control over that, and neither does your host, beyond moving accounts around after the fact.

## How cloud hosting is different

Cloud hosting spreads your site across virtualized, load-balanced infrastructure instead of a single physical box. In practice, for an SME, this means:

- Your site's performance doesn't depend on what other customers on the platform are doing
- Resources can scale to absorb a traffic spike instead of falling over
- Hosts can offer a meaningfully higher uptime guarantee, because the infrastructure itself is more resilient

You still manage your site the same way — through cPanel, the same file manager, the same one-click installs — cloud hosting changes what's underneath, not how you use it day to day.

## A practical way to decide

Ask yourself three questions:

1. **Would an hour of downtime cost you money or customers?** If yes, that's the strongest signal to move to cloud.
2. **Has your traffic roughly doubled since you signed up for hosting?** Shared hosting that was fine at launch often isn't fine a year later.
3. **Do you sell anything online, or handle customer data?** Payment pages and customer data are exactly where "cheap and occasionally slow" becomes a real business risk, not just an inconvenience.

If you answered yes to any of these, the cost difference between shared and cloud hosting is usually smaller than the cost of the downtime you're trying to avoid.

## What to look for when you switch

Not all "cloud hosting" is equal. When comparing plans, check for:

- **A published uptime guarantee** (99.9% is the industry-standard bar) — and what the host actually does if they miss it
- **Free SSL** included, not charged separately
- **Daily backups**, not just weekly
- **Free migration** from your current host, so switching doesn't mean redoing everything by hand
- **LiteSpeed or equivalent** web server software, which handles concurrent visitors noticeably better than older Apache-only setups on the same hardware

None of these are exotic features anymore — on a properly built cloud hosting plan, they should all be included as standard, not sold as add-ons.`,
  },
  {
    slug: "how-to-choose-domain-name-malaysia",
    title: "How to Choose the Right Domain Name (and TLD) for Your Malaysian Business",
    excerpt:
      "\".com\" isn't always the right call. Here's how to pick a domain name and extension that actually fits a Malaysian business, and what to avoid.",
    categorySlug: "domains",
    categoryName: CATEGORIES.domains,
    tagSlugs: ["domains", "tld", "malaysia-sme"],
    metaTitle: "How to Choose the Right Domain Name (and TLD) for Your Business",
    metaDescription:
      "A practical guide to picking a domain name and extension (.com, .com.my, .my) for a Malaysian business, plus what to avoid.",
    focusKeyword: "how to choose a domain name Malaysia",
    aiSummary:
      "Pick a domain name that is short, easy to say over the phone, and free of hyphens or numbers; then choose .com.my or .my when the business specifically serves Malaysian customers, since a local extension signals a Malaysian presence, and fall back to .com when you plan to serve customers outside Malaysia too.",
    keyEntities: "domain name, TLD, .com.my, .my domain, ICANN, domain privacy, WHOIS, Malaysia business registration",
    sourceCitations: [
      { label: "ICANN — Beginner's Guide to Domain Names", url: "https://www.icann.org/en/system/files/files/domain-names-beginners-guide-06dec10-en.pdf" },
    ],
    faqItems: [
      {
        question: "Should I register a .com or a .com.my domain?",
        answer:
          "If your customers are primarily in Malaysia, .com.my (or .my) signals that clearly and is often easier to find available. If you plan to serve customers outside Malaysia too, .com is the safer, more globally recognised default — many businesses register both and point them at the same site.",
      },
      {
        question: "Do I need documents to register a .com.my domain?",
        answer:
          "Yes — .com.my and other Malaysian-registry extensions typically require proof of a registered Malaysian business (like an SSM registration) or local presence, unlike .com, which anyone can register with no documentation.",
      },
      {
        question: "What is domain privacy, and do I need it?",
        answer:
          "Domain registration requires contact details on file with the registry; domain privacy (also called WHOIS privacy) replaces your personal details with the registrar's in the public WHOIS lookup, reducing spam and protecting your address from public exposure. It's worth having if you're registering the domain under a personal name rather than a company.",
      },
    ],
    body: `## Start with the name, not the extension

Before worrying about .com vs .com.my vs .my, get the name itself right. A good business domain name is:

- **Short enough to say over the phone without spelling it out**
- **Free of hyphens and numbers** — "shop-online2u.com" is much harder to remember and type correctly than "shoponline.com"
- **Close to your actual business or brand name**, not a keyword-stuffed guess at what people might search

If your exact brand name is taken, resist the urge to just tack on random words. A close, clean variation ("gotka.com" vs. forcing "gotkatechnologiesmalaysia.com") is almost always better for both memorability and typing accuracy.

## Choosing the right extension (TLD)

| Extension | Best for | Notes |
|---|---|---|
| **.com** | Any business, especially if you serve customers beyond Malaysia | The most globally recognised extension — the safe default |
| **.com.my** | Malaysian businesses wanting to signal local presence | Requires proof of a registered Malaysian business |
| **.my** | Shorter alternative to .com.my | Same registration requirements as .com.my |
| **.net / .co** | Fallback if your ideal .com is unavailable | Less immediately trusted by visitors than .com |

A common, low-risk approach: register both the .com and the .com.my version of your name if both are available, and point them at the same website. It costs a little more per year but protects your brand from a competitor registering the other one later.

## What Malaysian registries require

Unlike .com — which anyone in the world can register with no verification — .com.my and .my domains are administered under stricter rules and generally require evidence of a Malaysian business registration (SSM) or Malaysian residency/local presence. Budget a little extra time for this step if you're registering a local extension for the first time; it's not usually instant like a .com purchase.

## Common mistakes to avoid

- **Letting your domain expire.** Domains are typically registered for 1–3 years at a time and must be renewed — an expired domain can be picked up by someone else, including squatters, once the grace period passes.
- **Registering the domain under a personal email you'll lose access to.** Use a business email address you control, and make sure more than one person in the company has access to the registrar account.
- **Skipping domain lock.** Domain lock prevents unauthorized transfers away from your registrar — a basic security feature that should be on by default, not something you have to remember to enable.
- **Ignoring auto-renewal.** Set it up, or put a calendar reminder well before expiry — losing your domain because a renewal email got buried in spam is more common than it should be.

## The bottom line

Pick a name people can spell after hearing it once, default to .com unless you have a specific reason to lead with .com.my, and treat the domain — not just the website — as a real business asset worth protecting with domain lock, privacy, and a renewal reminder.`,
  },
  {
    slug: "business-website-cost-malaysia-2026",
    title: "How Much Does a Business Website Cost in Malaysia? A 2026 Pricing Guide",
    excerpt:
      "From a simple one-page site to a full e-commerce build — here's what actually drives website cost in Malaysia, and where the money goes.",
    categorySlug: "web-design",
    categoryName: CATEGORIES["web-design"],
    tagSlugs: ["web-design", "website-cost", "malaysia-sme"],
    metaTitle: "How Much Does a Business Website Cost in Malaysia? (2026 Guide)",
    metaDescription:
      "A breakdown of what drives business website costs in Malaysia — design, hosting, domain, and ongoing maintenance — so you can budget accurately.",
    focusKeyword: "business website cost Malaysia",
    aiSummary:
      "A basic Malaysian SME website typically costs far less than a custom e-commerce or web-app build, because most of the cost difference comes from the number of custom pages, integrations (like payment gateways), and ongoing maintenance required — not from hosting or domain fees, which are a small, fairly fixed part of the total.",
    keyEntities: "website cost, web design pricing, e-commerce website, domain registration cost, hosting cost, website maintenance",
    sourceCitations: [],
    faqItems: [
      {
        question: "What's the cheapest way to get a business website online?",
        answer:
          "A domain name plus a basic hosting plan and a template-based one-page or few-page site is the lowest-cost path — most of the ongoing cost at that tier is hosting and the domain renewal, not design.",
      },
      {
        question: "Why do e-commerce websites cost more than a brochure site?",
        answer:
          "E-commerce sites need product catalogues, a shopping cart, payment gateway integration, inventory handling, and usually more testing to make sure checkout works reliably — all of that is additional build and maintenance work beyond a static informational site.",
      },
      {
        question: "Is a one-time payment enough, or are there ongoing costs?",
        answer:
          "Expect ongoing costs regardless of build type: hosting renewal, domain renewal, and — if you want the site actively maintained, updated, and secured — either a maintenance plan or your own time to do it.",
      },
    ],
    body: `## What actually drives the price

Website cost in Malaysia varies enormously — and the biggest driver isn't hosting or the domain, it's **how much custom work the site needs**. Three tiers cover most small and medium businesses:

### 1. Simple informational website
A handful of pages — home, about, services, contact — usually built from a template with your branding, content, and images. This is the right fit for a business whose main goal is "be findable and look credible online," without needing bookings, payments, or accounts.

### 2. Custom-designed business website
Fully custom layout and design rather than a template, often with more pages, a blog, and closer attention to how the site represents your specific brand. This tier makes sense once your website is a serious part of how customers evaluate you before contacting you.

### 3. E-commerce or web application
Product catalogues, shopping cart, payment gateway integration, customer accounts, inventory — this is a meaningfully bigger build because checkout has to work reliably, securely, and handle edge cases (failed payments, stock running out, refunds).

## What's included beyond the design itself

A website quote should account for more than just the pages you see:

- **Domain registration** — a small annual cost, separate from the build
- **Hosting** — ongoing, typically billed annually or monthly
- **SSL certificate** — should be included free on any reputable hosting plan today, not a separate line item
- **Mobile responsiveness** — non-negotiable in 2026; a site that only works on desktop is effectively broken for most visitors
- **Basic on-page SEO setup** — page titles, descriptions, and a sitemap, so the site is actually indexable by search engines from day one

## Ongoing costs people forget to budget for

The build is a one-time cost; keeping a website running isn't:

- **Hosting renewal**, typically annual
- **Domain renewal**, typically annual, separate from hosting
- **Maintenance** — plugin/software updates, backups, and fixing anything that breaks after a platform update. Either you do this yourself, or you pay for a maintenance plan; skipping it entirely is how sites quietly become insecure or broken over time.
- **Content updates** — adding new services, pages, or blog posts as your business grows

## How to budget sensibly

1. **Start with the tier that matches what your business actually needs today** — you can always upgrade a simple site into a custom one later; you rarely need to over-build on day one.
2. **Ask exactly what's included in a quote** — hosting, domain, SSL, and how many rounds of revisions, specifically.
3. **Budget for year two, not just year one** — hosting and domain renewal, plus maintenance if you want it, are recurring costs that don't disappear after launch.

The right website for most Malaysian SMEs isn't the cheapest or the most expensive option — it's the tier that matches what the business needs the site to actually do.`,
  },
  {
    slug: "what-99-9-uptime-guarantee-means",
    title: "What Does a \"99.9% Uptime Guarantee\" Actually Mean for Your Website?",
    excerpt:
      "99.9% sounds like a rounding error — but it adds up to real minutes of downtime a year. Here's what the number actually means, and what to check.",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["uptime", "cloud-hosting", "security"],
    metaTitle: "What Does a 99.9% Uptime Guarantee Actually Mean?",
    metaDescription:
      "99.9% uptime still allows for downtime — here's exactly how much, what causes it, and what to check before trusting a host's uptime guarantee.",
    focusKeyword: "99.9% uptime guarantee meaning",
    aiSummary:
      "A 99.9% uptime guarantee allows for roughly 8.75 hours of downtime per year (about 43 minutes per month), which is why the exact percentage matters — the difference between 99.9% and 99.99% is the difference between hours and minutes of allowed downtime annually, and the value of the guarantee also depends on what the host actually does when they miss it.",
    keyEntities: "uptime guarantee, SLA, downtime, server monitoring, redundancy, hosting reliability",
    sourceCitations: [],
    faqItems: [
      {
        question: "How much downtime does 99.9% uptime actually allow?",
        answer:
          "About 8 hours and 45 minutes per year, or roughly 43 minutes per month, and about 1.4 minutes per day if spread evenly (in practice, downtime tends to happen in occasional short incidents rather than being evenly spread).",
      },
      {
        question: "Is a higher uptime percentage always worth paying more for?",
        answer:
          "For most SME websites, 99.9% is a reasonable, industry-standard bar. Going higher (99.99%) mainly matters for businesses where even a few minutes of downtime has a direct, measurable cost — e.g. high-volume e-commerce or time-sensitive booking systems.",
      },
      {
        question: "What should I check besides the uptime percentage itself?",
        answer:
          "Ask what the host actually does if they miss the guarantee (service credits are standard), whether the guarantee covers the whole hosting stack or just the server hardware, and whether they publish a status page showing real historical uptime.",
      },
    ],
    body: `## The number that sounds perfect but isn't

"99.9% uptime" sounds close enough to flawless that it's easy to skim past. But that 0.1% is real, allowed downtime — not a rounding error. Here's what it works out to:

| Guarantee | Downtime allowed per year | Per month | Per week |
|---|---|---|---|
| 99% | ~3.65 days | ~7.3 hours | ~1.7 hours |
| **99.9%** | **~8.75 hours** | **~43.8 minutes** | **~10.1 minutes** |
| 99.95% | ~4.4 hours | ~21.9 minutes | ~5 minutes |
| 99.99% | ~52.5 minutes | ~4.4 minutes | ~1 minute |

That's why the difference between 99% and 99.9% actually matters a lot — it's the difference between multiple days and under nine hours of allowed downtime per year — while the jump from 99.9% to 99.99% delivers a much smaller absolute improvement for most businesses, at a real cost premium.

## Where downtime actually comes from

Uptime guarantees are usually about the hosting infrastructure itself, but real-world downtime a business notices can come from several places:

- **Hardware or network failures** at the host — what the uptime guarantee is actually about
- **Scheduled maintenance** — reputable hosts do this with advance notice and try to minimise impact, but it still counts as downtime unless explicitly excluded
- **Your own website breaking** — a bad plugin update or a misconfiguration isn't the host's fault, and isn't covered by their uptime guarantee, even though it looks identical to a visitor
- **DNS or domain issues** — an expired domain or DNS misconfiguration takes a site offline in a way that has nothing to do with hosting uptime at all

This is why an uptime guarantee, on its own, doesn't guarantee your site is always reachable — it guarantees the *hosting infrastructure* meets that bar, which is still the foundation everything else depends on.

## What actually delivers real-world uptime

A published percentage is a promise; what makes it achievable is the infrastructure underneath:

- **Redundant hardware** — no single point of failure that takes the whole server down
- **Active monitoring** — problems get caught and responded to quickly, not discovered when a customer complains
- **Cloud/load-balanced infrastructure** rather than a single physical server, so one hardware fault doesn't equal one outage
- **A track record you can actually check** — a host with a public status page or history of honouring the guarantee is a stronger signal than the number on its own

## What to ask before trusting the number

1. **What happens if you miss it?** Reputable hosts offer service credits for downtime beyond the guarantee — if there's no stated remedy, the "guarantee" is really just a marketing claim.
2. **Does it cover the whole hosting stack, or only bare server uptime?** A server that's technically "up" but with a crashed web server process isn't a meaningful distinction to a visitor seeing an error page.
3. **Is there a public status page or history?** A guarantee is only as good as the follow-through — ask to see it, or look for independent reviews mentioning actual outages.

For most Malaysian SME websites, a properly delivered 99.9% guarantee — backed by redundant infrastructure and real monitoring — is a solid, sufficient bar. The number matters less than whether the host can actually back it up.`,
  },
  {
    slug: "digital-business-cards-vs-paper-name-cards",
    title: "Digital Business Cards vs Paper Name Cards: Why Malaysian SMEs Are Switching",
    excerpt:
      "Paper name cards run out, get lost, and go stale the moment your number changes. Here's what a digital business card actually solves.",
    categorySlug: "business-tips",
    categoryName: CATEGORIES["business-tips"],
    tagSlugs: ["digital-business-card", "malaysia-sme"],
    metaTitle: "Digital Business Cards vs Paper Name Cards: What's the Difference?",
    metaDescription:
      "Digital business cards vs traditional paper name cards — cost, convenience, and why more Malaysian SMEs are making the switch.",
    focusKeyword: "digital business card vs paper name card",
    aiSummary:
      "A digital business card is a shareable online profile (via link or QR code) with your contact details, links, and branding, that can be updated instantly and saved straight into a phone's contacts — unlike a paper name card, which is fixed the moment it's printed and gets thrown away as often as it gets kept.",
    keyEntities: "digital business card, digital namecard, QR code, paper name card, networking, contact sharing",
    sourceCitations: [],
    faqItems: [
      {
        question: "What exactly is a digital business card?",
        answer:
          "It's an online profile — usually accessed via a link or QR code — that holds your name, role, company, contact details, and links (website, socials, WhatsApp), which the person you share it with can view instantly and save straight into their phone's contacts.",
      },
      {
        question: "Can I update it after handing it out?",
        answer:
          "Yes — that's the core advantage over paper. If your phone number or job title changes, you update the digital card once, and everyone who has the link or saved contact sees the updated details automatically, without reprinting anything.",
      },
      {
        question: "Do I still need paper name cards at all?",
        answer:
          "Not necessarily, but some people still prefer having something physical to hand over in a first meeting. A common approach is a minimal physical card with just a QR code linking to the full digital profile — combining the tactile handoff with the always-up-to-date digital version.",
      },
    ],
    body: `## The problem paper name cards never solved

A paper name card is finished the moment it's printed. Change your phone number, your job title, or your company address, and every card already handed out is now wrong — and you're paying to print a new batch to fix it.

There's also a quieter problem: most paper cards are lost, thrown away, or sit forgotten in a drawer before anyone ever acts on the contact info. Getting your details in front of someone isn't the same as getting them saved.

## What a digital business card actually does

A digital business card puts the same information — name, role, company, phone, email, website, social links — behind a single shareable link or QR code. The person you share it with can:

- **View it instantly** on their own phone, no app install required
- **Save it directly to their contacts** with one tap, rather than manually typing your number in
- **Always see your current details**, because you update the one online profile instead of reprinting anything

For the business owner, this also means you can track how the card is used — where a service supports it, you can see how many times your card was viewed or saved, something a paper card can never tell you.

## Where digital cards clearly win

- **Networking events and conferences** — sharing a QR code is faster than digging for a card, and it can't run out mid-event
- **Sales teams** — every team member's card stays consistent and on-brand, and updating company details updates everyone at once
- **Businesses that change details often** — new phone number, new address, seasonal promotions — none of it requires reprinting
- **Anyone who wants to look current** — a digital card signals a business that's set up for how people actually exchange contact info today

## Where a physical card still has a place

Some people still expect to physically hand something over in a first meeting — it's a habit, not a functional need. A practical middle ground many Malaysian SMEs use: a minimal physical card with your name and a QR code, linking through to the full digital profile. You get the tactile handoff people are used to, without losing the always-up-to-date benefit of the digital version.

## The bottom line

Paper name cards aren't obsolete overnight, but they're solving less of the problem than they used to. A digital business card fixes the two things paper structurally can't: it stays current after you hand it out, and it makes saving your details a one-tap action instead of something the other person has to remember to do later.`,
  },
  {
    slug: "website-speed-checklist-cpanel-litespeed",
    title: "Website Loading Slowly? A 7-Point Speed Checklist for cPanel + LiteSpeed Hosting",
    excerpt:
      "Before you blame your host, run through this checklist — most slow-loading business websites share the same handful of fixable causes.",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["website-speed", "cpanel", "litespeed"],
    metaTitle: "Website Loading Slowly? A 7-Point Speed Checklist",
    metaDescription:
      "A practical checklist for diagnosing a slow website on cPanel + LiteSpeed hosting — images, caching, plugins, and what to check first.",
    focusKeyword: "website speed checklist cPanel LiteSpeed",
    aiSummary:
      "Most slow business websites are slowed down by a small, predictable set of causes — oversized images, no caching, too many third-party scripts, and outdated plugins/themes — and checking those first resolves the majority of speed complaints, before assuming the hosting itself is the problem.",
    keyEntities: "website speed, page load time, LiteSpeed cache, image optimization, Core Web Vitals, cPanel hosting",
    sourceCitations: [
      { label: "Google — Web Vitals", url: "https://web.dev/articles/vitals" },
    ],
    faqItems: [
      {
        question: "Is my hosting always the reason my website is slow?",
        answer:
          "Not usually. Hosting sets a ceiling on how fast a site *can* be, but oversized images, unoptimized code, and too many third-party scripts are more often the actual bottleneck — even good hosting can't fix an unoptimized website.",
      },
      {
        question: "What's the single highest-impact fix for most sites?",
        answer:
          "Image optimization. Uncompressed, full-resolution photos uploaded straight from a phone or camera are the most common single cause of slow page loads on small business websites.",
      },
      {
        question: "Does LiteSpeed actually make a measurable difference over Apache?",
        answer:
          "Yes, particularly under concurrent traffic — LiteSpeed is built to handle many simultaneous visitors more efficiently than a stock Apache setup on the same hardware, plus it pairs with LiteSpeed Cache for page-level caching that Apache doesn't offer natively.",
      },
    ],
    body: `## Before you blame your host

Slow websites are frustrating, and hosting is often the first thing people suspect — but in practice, most slow business websites share the same handful of fixable causes, unrelated to the server itself. Work through this checklist before assuming you need to upgrade hosting.

### 1. Check your images first

This is the single most common cause of a slow page. A photo straight off a modern phone camera can easily be several megabytes — for a website, it should usually be well under 300KB after resizing and compression. Resize images to the actual dimensions they'll display at, and run them through a compression tool before uploading.

### 2. Turn on caching

Without caching, your server rebuilds every page from scratch on every single visit. Caching stores a ready-to-serve version of the page and hands it out instantly instead. If you're on LiteSpeed hosting, **LiteSpeed Cache** is built for exactly this and is worth confirming is actually enabled — it's one of the highest-impact, lowest-effort fixes available.

### 3. Audit your plugins and scripts

Every plugin, tracking script, and embedded widget adds load time. Go through your site's plugins and third-party embeds (chat widgets, social feeds, analytics tools) and remove anything you're not actually using or benefiting from. It's common to find plugins that were installed once for a specific need and never removed.

### 4. Keep your platform and theme updated

Outdated CMS software, themes, and plugins aren't just a security risk — older versions are frequently less efficient than current ones. Updates often include real performance improvements alongside security fixes.

### 5. Minimize redirects

Every redirect (old-url → new-url) adds an extra round-trip before the page can even start loading. A couple of redirects won't be noticeable, but a chain of several stacked redirects meaningfully slows down the first byte a visitor receives.

### 6. Check your hosting resources match your site

If you're on a basic shared hosting plan and your site has grown — more content, more traffic, an online store — the plan itself may genuinely be under-resourced now, even if it was fine at launch. This is the point where moving to cloud hosting (see our guide on [cloud vs shared hosting](/blog/cloud-hosting-vs-shared-hosting-malaysia/)) starts to matter.

### 7. Test from a real connection, not just your office wifi

Your own device may have cached assets or a fast connection that isn't representative of your actual visitors. Test using a tool that simulates a fresh visitor on a typical mobile connection — that's a much closer approximation of what most of your customers actually experience.

## Putting it together

Run through items 1–5 first — they're free, within your control, and fix the large majority of speed complaints on business websites. If the site is still slow after that, item 6 (hosting resources) is the next honest thing to check, rather than the first.`,
  },
];

async function upsertCategory(slug: string, name: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

async function upsertTag(slug: string, name: string) {
  return prisma.tag.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.warn(
      `No user found for SEED_ADMIN_EMAIL="${adminEmail}" — posts will be created without an author. Run the main seed (npx tsx prisma/seed.ts) first if you want an author attached.`,
    );
  }

  const categoryCache = new Map<string, string>();
  for (const [slug, name] of Object.entries(CATEGORIES)) {
    const category = await upsertCategory(slug, name);
    categoryCache.set(slug, category.id);
  }

  const tagCache = new Map<string, string>();
  for (const [slug, name] of Object.entries(TAGS)) {
    const tag = await upsertTag(slug, name);
    tagCache.set(slug, tag.id);
  }

  for (const post of POSTS) {
    const categoryId = categoryCache.get(post.categorySlug);
    const tagIds = post.tagSlugs.map((s) => tagCache.get(s)).filter((id): id is string => Boolean(id));

    const shared = {
      type: "POST" as const,
      status: "PUBLISHED" as const,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      categoryId,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      focusKeyword: post.focusKeyword,
      aiSummary: post.aiSummary,
      keyEntities: post.keyEntities,
      sourceCitations: post.sourceCitations.length ? JSON.stringify(post.sourceCitations) : null,
      lastFactCheckedAt: new Date(),
    };

    const existing = await prisma.content.findUnique({ where: { slug: post.slug } });

    if (existing) {
      await prisma.content.update({ where: { slug: post.slug }, data: shared });
      console.log(`Updated: ${post.slug}`);
    } else {
      await prisma.content.create({
        data: {
          ...shared,
          slug: post.slug,
          publishedAt: new Date(),
          authorId: admin?.id,
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
          faqItems: {
            create: post.faqItems.map((f, i) => ({ question: f.question, answer: f.answer, order: i })),
          },
        },
      });
      console.log(`Created: ${post.slug}`);
    }
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
