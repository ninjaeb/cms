/**
 * SEO/GEO blog content pack for gotka.com's /blog — six posts, each written
 * in English, Bahasa Malaysia, and Chinese, covering Gotka Technologies'
 * core services (cloud hosting, domains, web design, digital business
 * cards), aimed at the Malaysian SME audience.
 *
 * A translation shares its slug with the other locales' version of the same
 * post — [slug, locale] identifies a row, not slug alone (see
 * prisma/schema.prisma and src/lib/staticSite/i18n.ts). English syncs to
 * /blog/{slug}/; Malay and Chinese sync to /ms/blog/{slug}/ and
 * /zh/blog/{slug}/.
 *
 * Categories and tags are shared (English-only) across all three languages
 * for now — translating the taxonomy itself is a reasonable follow-up, not
 * done here.
 *
 * Run on the server after the schema is migrated:
 *   npx tsx prisma/seed-gotka-blog.ts
 *
 * Idempotent for text fields: re-running updates each locale's text/SEO
 * fields (matched by slug + locale) without duplicating rows. Tags and FAQ
 * items are only attached when a row is first created — editing those
 * later is easiest from /admin. Also syncs every row to the linked static
 * site (src/lib/staticSite/sync.ts) the same way the admin's save action
 * does, so running this script alone produces both the database rows and
 * the rendered static HTML.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { syncContentToStaticSite, regenerateAllBlogIndexes } from "../src/lib/staticSite/sync";

type Locale = "en" | "ms" | "zh";
const LOCALES: Locale[] = ["en", "ms", "zh"];

type Faq = { question: string; answer: string };
type Citation = { label: string; url: string };

type LocaleContent = {
  title: string;
  excerpt: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  aiSummary: string;
  keyEntities: string;
  faqItems: Faq[];
};

type PostGroup = {
  slug: string;
  categorySlug: string;
  categoryName: string;
  tagSlugs: string[];
  sourceCitations: Citation[];
  locales: Record<Locale, LocaleContent>;
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

const POSTS: PostGroup[] = [
  {
    slug: "cloud-hosting-vs-shared-hosting-malaysia",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["cloud-hosting", "cpanel", "malaysia-sme"],
    sourceCitations: [
      {
        label: "Google Search Central — Page Experience",
        url: "https://developers.google.com/search/docs/appearance/page-experience",
      },
    ],
    locales: {
      en: {
        title: "Cloud Hosting vs Shared Hosting: Which Is Right for Your Malaysian Business?",
        excerpt:
          "Shared hosting is the cheapest way to get a site online, but it isn't built for a growing business. Here's how to tell which stage you're at.",
        metaTitle: "Cloud Hosting vs Shared Hosting: Which Is Right for Your Business?",
        metaDescription:
          "Compare cloud hosting and traditional shared hosting for Malaysian SMEs — cost, performance, and uptime — and learn when it's time to upgrade.",
        focusKeyword: "cloud hosting vs shared hosting Malaysia",
        aiSummary:
          "Shared hosting is fine for a brand-new site with light traffic, since the low cost comes from many websites sharing one server's resources. Cloud hosting is worth the switch once a site handles real customer traffic, takes online payments, or can't afford downtime, because cloud infrastructure isolates each site from other tenants' traffic spikes and typically carries a stronger uptime guarantee.",
        keyEntities: "cloud hosting, shared hosting, cPanel, LiteSpeed, uptime guarantee, Malaysia SME hosting",
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
      ms: {
        title: "Pengehosan Awan lwn Pengehosan Kongsi: Mana Satu Sesuai untuk Perniagaan Anda di Malaysia?",
        excerpt:
          "Pengehosan kongsi ialah cara paling murah untuk meletakkan laman web anda dalam talian, tetapi ia bukan direka untuk perniagaan yang sedang berkembang. Berikut cara mengenal pasti tahap perniagaan anda.",
        metaTitle: "Pengehosan Awan lwn Pengehosan Kongsi: Mana Satu Sesuai untuk Anda?",
        metaDescription:
          "Bandingkan pengehosan awan dan pengehosan kongsi tradisional untuk PKS Malaysia — kos, prestasi dan masa tiada gangguan — dan ketahui bila masanya untuk menaik taraf.",
        focusKeyword: "pengehosan awan lwn pengehosan kongsi Malaysia",
        aiSummary:
          "Pengehosan kongsi memadai untuk laman web baharu dengan trafik ringan kerana kos rendahnya datang daripada banyak laman web berkongsi sumber satu pelayan. Pengehosan awan berbaloi untuk beralih sebaik sahaja laman web anda mengendalikan trafik pelanggan sebenar, menerima pembayaran dalam talian, atau tidak mampu menanggung masa gangguan — kerana infrastruktur awan mengasingkan setiap laman daripada lonjakan trafik penyewa lain dan biasanya membawa jaminan masa tiada gangguan yang lebih kukuh.",
        keyEntities: "pengehosan awan, pengehosan kongsi, cPanel, LiteSpeed, jaminan masa tiada gangguan, pengehosan PKS Malaysia",
        faqItems: [
          {
            question: "Adakah pengehosan awan lebih mahal daripada pengehosan kongsi?",
            answer:
              "Biasanya ya, tetapi jurang itu lebih kecil daripada yang disangka kebanyakan pemilik perniagaan — pelan awan yang direka untuk PKS (seperti pengehosan awan berasaskan cPanel) selalunya hanya sedikit lebih mahal daripada pengehosan kongsi, sebagai balasan untuk sumber khusus dan jaminan masa tiada gangguan yang lebih kukuh.",
          },
          {
            question: "Bolehkah saya beralih daripada pengehosan kongsi kepada pengehosan awan kemudian?",
            answer:
              "Ya. Kebanyakan penyedia hosting, termasuk Gotka, menawarkan migrasi percuma apabila anda menaik taraf, jadi anda tidak perlu melebih-lebihkan sumber pada hari pertama — mulakan dengan pengehosan kongsi dan naik taraf apabila trafik atau keperluan masa tiada gangguan anda benar-benar memerlukannya.",
          },
          {
            question: "Adakah pengehosan awan secara automatik menjadikan laman web saya lebih pantas?",
            answer:
              "Ia menghapuskan punca utama laman kongsi yang perlahan — pertikaian sumber daripada 'jiran bising' — tetapi kelajuan sebenar turut bergantung pada kod, imej dan persediaan cache laman web anda sendiri.",
          },
        ],
        body: `## Jawapan ringkas

Jika laman web anda baharu, mempunyai trafik sederhana, dan masa gangguan selama sejam tidak akan menjejaskan perniagaan anda — pengehosan kongsi sememangnya memadai. Jika pelanggan membayar anda melalui laman web, anda tidak mampu menanggung risiko gangguan semasa waktu perniagaan, atau trafik anda telah berkembang melebihi apa yang anda perlukan semasa mendaftar pertama kali — sudah tiba masanya untuk melihat pengehosan awan.

## Bagaimana pengehosan kongsi sebenarnya berfungsi

Pengehosan kongsi meletakkan berpuluh (kadangkala beratus) laman web pada satu pelayan fizikal, semuanya berkongsi CPU, memori dan I/O cakera yang sama. Itulah sebabnya ia murah — anda hanya membayar sebahagian kecil kos pelayan kerana anda menggunakan sebahagian kecil sumbernya, kebanyakan masa.

Masalahnya: jika laman web lain pada pelayan yang sama tiba-tiba mengalami lonjakan trafik (catatan yang menjadi viral, serangan bot, plugin yang ditulis dengan buruk berulang tanpa henti), semua orang yang berkongsi pelayan itu — termasuk anda — boleh menjadi perlahan atau terputus sambungan bersamanya. Anda tiada kawalan ke atas perkara ini, begitu juga penyedia hosting anda, selain daripada memindahkan akaun selepas kejadian berlaku.

## Bagaimana pengehosan awan berbeza

Pengehosan awan mengedarkan laman web anda merentasi infrastruktur maya berimbang beban, bukannya satu kotak fizikal. Secara praktikal, untuk PKS, ini bermaksud:

- Prestasi laman web anda tidak bergantung pada apa yang pelanggan lain pada platform tersebut sedang lakukan
- Sumber boleh berskala untuk menyerap lonjakan trafik dan bukannya terjejas
- Penyedia hosting boleh menawarkan jaminan masa tiada gangguan yang jauh lebih tinggi, kerana infrastruktur itu sendiri lebih tahan lasak

Anda masih menguruskan laman web anda dengan cara yang sama — melalui cPanel, pengurus fail yang sama, pemasangan satu klik yang sama — pengehosan awan mengubah apa yang berada di bawahnya, bukan cara anda menggunakannya setiap hari.

## Cara praktikal untuk membuat keputusan

Tanya diri anda tiga soalan:

1. **Adakah gangguan selama sejam akan menjejaskan wang atau pelanggan anda?** Jika ya, itu isyarat paling kuat untuk beralih kepada awan.
2. **Adakah trafik anda hampir berganda sejak anda mendaftar pengehosan?** Pengehosan kongsi yang memadai semasa pelancaran selalunya tidak lagi memadai setahun kemudian.
3. **Adakah anda menjual apa-apa dalam talian, atau mengendalikan data pelanggan?** Halaman pembayaran dan data pelanggan adalah tempat di mana 'murah dan kadangkala perlahan' menjadi risiko perniagaan sebenar, bukan sekadar kesulitan.

Jika anda menjawab ya untuk mana-mana soalan ini, perbezaan kos antara pengehosan kongsi dan awan biasanya lebih kecil daripada kos masa gangguan yang cuba anda elakkan.

## Apa yang perlu dicari apabila anda beralih

Bukan semua 'pengehosan awan' adalah sama. Apabila membandingkan pelan, semak perkara berikut:

- **Jaminan masa tiada gangguan yang diterbitkan** (99.9% adalah piawaian industri) — dan apa sebenarnya yang dilakukan penyedia hosting jika mereka gagal memenuhinya
- **SSL percuma** disertakan, bukan dicaj berasingan
- **Sandaran harian**, bukan sekadar mingguan
- **Migrasi percuma** daripada penyedia hosting semasa anda, supaya beralih tidak bermakna anda perlu melakukan semuanya semula secara manual
- **LiteSpeed atau setaraf**, perisian pelayan web yang mengendalikan pelawat serentak dengan jauh lebih baik berbanding persediaan Apache sahaja yang lebih lama pada perkakasan yang sama

Tiada satu pun daripada ini eksotik lagi — pada pelan pengehosan awan yang dibina dengan betul, semuanya patut disertakan sebagai standard, bukan dijual sebagai tambahan.`,
      },
      zh: {
        title: "云主机与共享主机对比：哪种更适合您在马来西亚的业务？",
        excerpt:
          "共享主机是让网站上线最便宜的方式，但它并非为不断成长的企业而设计。以下教您如何判断自己的企业正处于哪个阶段。",
        metaTitle: "云主机与共享主机对比：哪种更适合您？",
        metaDescription: "对比云主机与传统共享主机在马来西亚中小企业中的成本、性能与正常运行时间表现，并了解何时该升级。",
        focusKeyword: "云主机与共享主机对比 马来西亚",
        aiSummary:
          "共享主机适合流量较小的新网站，因为其低成本来自许多网站共用同一台服务器的资源。一旦网站开始处理真实客户流量、接受在线支付，或无法承受停机损失，就值得升级到云主机——因为云基础架构能让每个网站不受其他租户流量高峰的影响，通常还提供更强的正常运行时间保证。",
        keyEntities: "云主机, 共享主机, cPanel, LiteSpeed, 正常运行时间保证, 马来西亚中小企业主机",
        faqItems: [
          {
            question: "云主机是否比共享主机贵？",
            answer:
              "通常是的，但差距比大多数企业主想象的要小——专为中小企业打造的云主机方案（如基于 cPanel 的云主机）价格通常只比共享主机略高，换来的是专属资源和更强的正常运行时间保证。",
          },
          {
            question: "以后可以从共享主机升级到云主机吗？",
            answer:
              "可以。包括 Gotka 在内的大多数主机商在您升级时都提供免费迁移服务，因此您无需一开始就过度配置资源——先从共享主机起步，等流量或正常运行时间需求真正提高时再升级。",
          },
          {
            question: "云主机会自动让我的网站更快吗？",
            answer: "它消除了共享主机变慢的最大原因——'邻居噪音'式的资源争用——但真正的速度还取决于您网站自身的代码、图片和缓存设置。",
          },
        ],
        body: `## 简短回答

如果您的网站刚上线不久、流量不大，即使停机一小时也不会对业务造成影响，那么共享主机完全够用。但如果客户通过您的网站付款、您承担不起营业时间内的停机风险，或者您的流量已经远超当初注册时的水平——现在就是该考虑云主机的时候了。

## 共享主机的真实运作方式

共享主机让数十个（有时甚至数百个）网站共用同一台物理服务器，共享相同的 CPU、内存和磁盘 I/O。这正是它便宜的原因——您支付的只是服务器成本的一小部分，因为您大部分时间只使用其中一小部分资源。

问题在于：如果同一服务器上的其他网站突然流量激增（一篇爆红的帖子、一次机器人攻击、一个写得很糟糕又不断循环的插件），与您共享该服务器的所有人——包括您在内——都可能因此变慢或掉线。您对此无能为力，主机商也一样，事后顶多只能重新分配账户。

## 云主机的不同之处

云主机将您的网站分布在虚拟化、负载均衡的基础架构上，而不是单一物理主机上。对中小企业来说，这实际意味着：

- 您网站的性能不取决于平台上其他客户在做什么
- 资源可以弹性扩展以吸收流量高峰，而不是直接崩溃
- 主机商能够提供更高的正常运行时间保证，因为基础架构本身更具韧性

您管理网站的方式不变——依然是 cPanel、同样的文件管理器、同样的一键安装——云主机改变的是底层架构，而不是您日常的使用方式。

## 实用的判断方法

问自己三个问题：

1. **停机一小时会让您损失金钱或客户吗？** 如果是，这是升级到云主机最强的信号。
2. **自您注册主机以来，流量是否几乎翻倍？** 上线时够用的共享主机，一年后往往就不够用了。
3. **您是否在线销售商品，或处理客户数据？** 支付页面和客户数据正是"便宜且偶尔卡顿"从小麻烦变成真正业务风险的地方。

只要以上任何一题您的答案是"是"，共享主机与云主机之间的价差，通常都远小于您试图避免的停机损失。

## 升级时该注意什么

并非所有"云主机"都一样。比较方案时，请留意以下几点：

- **公开的正常运行时间保证**（99.9% 是行业标准门槛）——以及主机商未达标时实际会怎么处理
- **免费 SSL**，而不是另外收费
- **每日备份**，而不仅仅是每周备份
- **免费迁移**服务，从您目前的主机商迁移过来，让升级不必从头手动来一遍
- **LiteSpeed 或同等级**的网页服务器软件，在相同硬件下处理并发访客的能力明显优于仅使用较旧 Apache 的方案

这些如今都不算什么稀奇的功能——在一个搭建得当的云主机方案中，它们都应该是标准配置，而不是额外收费的附加项目。`,
      },
    },
  },
  {
    slug: "how-to-choose-domain-name-malaysia",
    categorySlug: "domains",
    categoryName: CATEGORIES.domains,
    tagSlugs: ["domains", "tld", "malaysia-sme"],
    sourceCitations: [
      {
        label: "ICANN — Beginner's Guide to Domain Names",
        url: "https://www.icann.org/en/system/files/files/domain-names-beginners-guide-06dec10-en.pdf",
      },
    ],
    locales: {
      en: {
        title: "How to Choose the Right Domain Name (and TLD) for Your Malaysian Business",
        excerpt:
          "\".com\" isn't always the right call. Here's how to pick a domain name and extension that actually fits a Malaysian business, and what to avoid.",
        metaTitle: "How to Choose the Right Domain Name (and TLD) for Your Business",
        metaDescription:
          "A practical guide to picking a domain name and extension (.com, .com.my, .my) for a Malaysian business, plus what to avoid.",
        focusKeyword: "how to choose a domain name Malaysia",
        aiSummary:
          "Pick a domain name that is short, easy to say over the phone, and free of hyphens or numbers; then choose .com.my or .my when the business specifically serves Malaysian customers, since a local extension signals a Malaysian presence, and fall back to .com when you plan to serve customers outside Malaysia too.",
        keyEntities: "domain name, TLD, .com.my, .my domain, ICANN, domain privacy, WHOIS, Malaysia business registration",
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
      ms: {
        title: "Cara Memilih Nama Domain (dan TLD) yang Tepat untuk Perniagaan Anda di Malaysia",
        excerpt:
          "\".com\" tidak selalu pilihan yang tepat. Berikut cara memilih nama domain dan sambungan yang benar-benar sesuai untuk perniagaan Malaysia, dan apa yang perlu dielakkan.",
        metaTitle: "Cara Memilih Nama Domain (dan TLD) yang Tepat untuk Perniagaan Anda",
        metaDescription:
          "Panduan praktikal untuk memilih nama domain dan sambungan (.com, .com.my, .my) bagi perniagaan Malaysia, serta apa yang perlu dielakkan.",
        focusKeyword: "cara memilih nama domain Malaysia",
        aiSummary:
          "Pilih nama domain yang pendek, mudah disebut melalui telefon, dan bebas daripada sengkang atau nombor; kemudian pilih .com.my atau .my apabila perniagaan itu khusus melayani pelanggan Malaysia, kerana sambungan tempatan menandakan kehadiran Malaysia, dan gunakan .com sebagai pilihan asas apabila anda merancang untuk melayani pelanggan di luar Malaysia juga.",
        keyEntities: "nama domain, TLD, .com.my, domain .my, ICANN, privasi domain, WHOIS, pendaftaran perniagaan Malaysia",
        faqItems: [
          {
            question: "Patutkah saya mendaftar domain .com atau .com.my?",
            answer:
              "Jika pelanggan anda kebanyakannya berada di Malaysia, .com.my (atau .my) menandakan itu dengan jelas dan selalunya lebih mudah dicari yang masih tersedia. Jika anda merancang untuk melayani pelanggan di luar Malaysia juga, .com adalah pilihan asas yang lebih selamat dan lebih dikenali secara global — ramai perniagaan mendaftar kedua-duanya dan mengarahkannya ke laman web yang sama.",
          },
          {
            question: "Perlukah saya dokumen untuk mendaftar domain .com.my?",
            answer:
              "Ya — .com.my dan sambungan registri Malaysia yang lain biasanya memerlukan bukti perniagaan Malaysia yang berdaftar (seperti pendaftaran SSM) atau kehadiran tempatan, berbeza dengan .com yang boleh didaftarkan oleh sesiapa sahaja tanpa dokumen.",
          },
          {
            question: "Apakah privasi domain, dan perlukah saya menggunakannya?",
            answer:
              "Pendaftaran domain memerlukan butiran hubungan direkodkan dengan registri; privasi domain (juga dipanggil privasi WHOIS) menggantikan butiran peribadi anda dengan butiran pendaftar dalam carian WHOIS awam, mengurangkan spam dan melindungi alamat anda daripada pendedahan awam. Ia berbaloi jika anda mendaftar domain di bawah nama peribadi dan bukannya syarikat.",
          },
        ],
        body: `## Mulakan dengan nama, bukan sambungan

Sebelum bimbang tentang .com berbanding .com.my berbanding .my, pastikan nama itu sendiri betul dahulu. Nama domain perniagaan yang baik ialah:

- **Cukup pendek untuk disebut melalui telefon tanpa perlu dieja**
- **Bebas daripada sengkang dan nombor** — "kedai-online2u.com" jauh lebih sukar diingati dan ditaip dengan betul berbanding "kedaionline.com"
- **Hampir dengan nama perniagaan atau jenama sebenar anda**, bukan tekaan penuh kata kunci tentang apa yang mungkin dicari orang

Jika nama jenama sebenar anda telah diambil, jangan tergoda untuk sekadar menambah perkataan rawak. Variasi yang bersih dan hampir sama ("gotka.com" berbanding memaksa "gotkateknologimalaysia.com") hampir selalu lebih baik untuk kedua-dua ingatan dan ketepatan menaip.

## Memilih sambungan (TLD) yang tepat

| Sambungan | Paling sesuai untuk | Nota |
|---|---|---|
| **.com** | Sebarang perniagaan, terutamanya jika anda melayani pelanggan di luar Malaysia | Sambungan paling dikenali secara global — pilihan asas yang selamat |
| **.com.my** | Perniagaan Malaysia yang ingin menandakan kehadiran tempatan | Memerlukan bukti perniagaan Malaysia yang berdaftar |
| **.my** | Alternatif lebih pendek kepada .com.my | Keperluan pendaftaran sama seperti .com.my |
| **.net / .co** | Pilihan alternatif jika .com idaman anda tidak tersedia | Kurang segera dipercayai oleh pelawat berbanding .com |

Pendekatan biasa yang berisiko rendah: daftar kedua-dua versi .com dan .com.my bagi nama anda jika kedua-duanya tersedia, dan arahkan kedua-duanya ke laman web yang sama. Ia memerlukan sedikit kos tambahan setiap tahun tetapi melindungi jenama anda daripada didaftar oleh pesaing kemudian.

## Apa yang registri Malaysia perlukan

Berbeza dengan .com — yang boleh didaftarkan oleh sesiapa sahaja di dunia tanpa pengesahan — domain .com.my dan .my ditadbir di bawah peraturan yang lebih ketat dan umumnya memerlukan bukti pendaftaran perniagaan Malaysia (SSM) atau kediaman/kehadiran tempatan di Malaysia. Peruntukkan sedikit masa tambahan untuk langkah ini jika anda mendaftar sambungan tempatan buat kali pertama; ia biasanya tidak segera seperti pembelian .com.

## Kesilapan biasa yang perlu dielakkan

- **Membiarkan domain anda luput.** Domain biasanya didaftar untuk 1–3 tahun sekali dan mesti diperbaharui — domain yang luput boleh diambil oleh sesiapa sahaja, termasuk penceroboh domain, selepas tempoh tangguh berlalu.
- **Mendaftar domain di bawah e-mel peribadi yang mungkin anda hilang akses.** Gunakan alamat e-mel perniagaan yang anda kawal, dan pastikan lebih daripada seorang dalam syarikat mempunyai akses kepada akaun pendaftar.
- **Mengabaikan kunci domain.** Kunci domain menghalang pemindahan tanpa kebenaran daripada pendaftar anda — ciri keselamatan asas yang sepatutnya diaktifkan secara lalai, bukan sesuatu yang perlu anda ingat untuk aktifkan.
- **Mengabaikan pembaharuan automatik.** Sediakan ia, atau letakkan peringatan kalendar jauh sebelum tarikh luput — kehilangan domain anda kerana e-mel pembaharuan tertimbus dalam spam adalah lebih biasa daripada yang sepatutnya.

## Kesimpulannya

Pilih nama yang orang boleh eja selepas mendengarnya sekali, gunakan .com sebagai asas melainkan anda mempunyai sebab khusus untuk mengutamakan .com.my, dan anggap domain — bukan sekadar laman web — sebagai aset perniagaan sebenar yang berbaloi dilindungi dengan kunci domain, privasi dan peringatan pembaharuan.`,
      },
      zh: {
        title: "如何为您的马来西亚企业选择合适的域名（和顶级域名）",
        excerpt: "\".com\" 并非总是正确选择。以下教您如何为马来西亚企业选择合适的域名和后缀，以及应避免的事项。",
        metaTitle: "如何为您的企业选择合适的域名（和顶级域名）",
        metaDescription: "为马来西亚企业选择域名和后缀（.com、.com.my、.my）的实用指南，以及应避免的常见错误。",
        focusKeyword: "如何选择域名 马来西亚",
        aiSummary:
          "选择简短、易于电话口述、且不含连字符或数字的域名；当企业专门服务马来西亚客户时，选择 .com.my 或 .my，因为本地后缀能明确传达马来西亚背景；若同时计划服务马来西亚以外的客户，则以 .com 作为更稳妥的默认选择。",
        keyEntities: "域名, 顶级域名, .com.my, .my 域名, ICANN, 域名隐私, WHOIS, 马来西亚企业注册",
        faqItems: [
          {
            question: "我应该注册 .com 还是 .com.my 域名？",
            answer:
              "如果您的客户主要在马来西亚，.com.my（或 .my）能明确传达这一点，而且往往更容易找到可用的名称。如果您同时计划服务马来西亚以外的客户，.com 是更稳妥、更具全球知名度的默认选择——许多企业会同时注册两者并指向同一网站。",
          },
          {
            question: "注册 .com.my 域名需要文件吗？",
            answer:
              "需要——.com.my 及其他马来西亚注册局的后缀通常要求提供已注册马来西亚企业的证明（如 SSM 注册）或本地身份证明，而 .com 则任何人都可以注册，无需任何文件。",
          },
          {
            question: "什么是域名隐私保护，我需要吗？",
            answer:
              "域名注册要求在注册局留存联系信息；域名隐私保护（也称 WHOIS 隐私保护）会用注册商的信息替代您的个人信息出现在公开 WHOIS 查询中，从而减少垃圾邮件并保护您的地址不被公开。如果您是以个人名义而非公司名义注册域名，这项服务很值得使用。",
          },
        ],
        body: `## 先确定名称，而非后缀

在纠结 .com 与 .com.my 与 .my 之前，先把名称本身定下来。一个好的企业域名应该：

- **足够简短，电话里说一遍对方就能听懂，无需逐字拼读**
- **不含连字符和数字**——"shop-online2u.com" 远比 "shoponline.com" 难记也难打对
- **贴近您真实的企业或品牌名称**，而不是堆砌关键词、猜测用户会搜什么

如果您理想中的确切品牌名已被注册，不要冲动地随意加上其他词语。一个干净、相近的变体（如 "gotka.com"，而非硬凑成 "gotkatechnologiesmalaysia.com"）在易记性和输入准确性上几乎总是更优的选择。

## 选择合适的后缀（顶级域名）

| 后缀 | 最适合 | 说明 |
|---|---|---|
| **.com** | 任何企业，尤其是服务马来西亚以外客户的企业 | 全球认可度最高的后缀——稳妥的默认选择 |
| **.com.my** | 希望突出本地身份的马来西亚企业 | 需要提供已注册马来西亚企业的证明 |
| **.my** | .com.my 的简短替代方案 | 注册要求与 .com.my 相同 |
| **.net / .co** | 理想的 .com 不可用时的备选 | 访客对其信任度不如 .com |

一种常见且风险较低的做法：如果理想名称的 .com 和 .com.my 版本都可用，两个都注册下来，并都指向同一网站。这样每年会多花一点费用，但能保护您的品牌不被竞争对手日后抢注另一个后缀。

## 马来西亚注册局的要求

与任何人都能注册、无需验证的 .com 不同，.com.my 和 .my 域名由更严格的规则管理，通常要求提供马来西亚企业注册（SSM）证明或马来西亚本地居留/存在证明。如果您是第一次注册本地后缀，请预留额外时间——它通常不像购买 .com 那样即时完成。

## 应避免的常见错误

- **让域名过期。** 域名通常一次注册 1–3 年，必须续费——过期域名一旦过了宽限期，就可能被他人（包括域名抢注者）抢先注册。
- **用可能失去访问权限的个人邮箱注册域名。** 使用您自己掌控的企业邮箱，并确保公司内不止一人能访问注册商账户。
- **忽略域名锁定。** 域名锁定可防止未经授权从注册商转出——这是应默认开启的基本安全功能，而不是需要您特意记得去启用的东西。
- **忽略自动续费。** 设置好自动续费，或在到期前提早设置日历提醒——因续费邮件淹没在垃圾邮件中而失去域名的情况，比想象中更常见。

## 结语

选一个别人听一遍就会拼写的名称；除非有特别理由优先选择 .com.my，否则默认使用 .com；并把域名——而不仅仅是网站本身——当作一项值得用域名锁定、隐私保护和续费提醒来加以保护的真正企业资产。`,
      },
    },
  },
  {
    slug: "business-website-cost-malaysia-2026",
    categorySlug: "web-design",
    categoryName: CATEGORIES["web-design"],
    tagSlugs: ["web-design", "website-cost", "malaysia-sme"],
    sourceCitations: [],
    locales: {
      en: {
        title: "How Much Does a Business Website Cost in Malaysia? A 2026 Pricing Guide",
        excerpt:
          "From a simple one-page site to a full e-commerce build — here's what actually drives website cost in Malaysia, and where the money goes.",
        metaTitle: "How Much Does a Business Website Cost in Malaysia? (2026 Guide)",
        metaDescription:
          "A breakdown of what drives business website costs in Malaysia — design, hosting, domain, and ongoing maintenance — so you can budget accurately.",
        focusKeyword: "business website cost Malaysia",
        aiSummary:
          "A basic Malaysian SME website typically costs far less than a custom e-commerce or web-app build, because most of the cost difference comes from the number of custom pages, integrations (like payment gateways), and ongoing maintenance required — not from hosting or domain fees, which are a small, fairly fixed part of the total.",
        keyEntities: "website cost, web design pricing, e-commerce website, domain registration cost, hosting cost, website maintenance",
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
      ms: {
        title: "Berapakah Kos Membina Laman Web Perniagaan di Malaysia? Panduan Harga 2026",
        excerpt:
          "Daripada laman web mudah sehalaman kepada pembinaan e-dagang penuh — berikut sebenarnya yang menentukan kos laman web di Malaysia, dan ke mana wang itu pergi.",
        metaTitle: "Berapakah Kos Laman Web Perniagaan di Malaysia? (Panduan 2026)",
        metaDescription:
          "Pecahan tentang apa yang menentukan kos laman web perniagaan di Malaysia — reka bentuk, hosting, domain dan penyelenggaraan berterusan — supaya anda boleh membuat belanjawan dengan tepat.",
        focusKeyword: "kos laman web perniagaan Malaysia",
        aiSummary:
          "Laman web PKS Malaysia yang asas biasanya jauh lebih murah berbanding pembinaan e-dagang atau aplikasi web tersuai, kerana kebanyakan perbezaan kos datang daripada bilangan halaman tersuai, integrasi (seperti get pembayaran) dan penyelenggaraan berterusan yang diperlukan — bukan daripada yuran hosting atau domain, yang merupakan sebahagian kecil dan agak tetap daripada jumlah keseluruhan.",
        keyEntities: "kos laman web, harga reka bentuk web, laman web e-dagang, kos pendaftaran domain, kos hosting, penyelenggaraan laman web",
        faqItems: [
          {
            question: "Apakah cara paling murah untuk meletakkan laman web perniagaan dalam talian?",
            answer:
              "Nama domain ditambah pelan hosting asas dan laman web berasaskan templat sehalaman atau beberapa halaman ialah laluan kos paling rendah — kebanyakan kos berterusan pada tahap ini ialah hosting dan pembaharuan domain, bukan reka bentuk.",
          },
          {
            question: "Mengapa laman web e-dagang lebih mahal daripada laman web brosur?",
            answer:
              "Laman e-dagang memerlukan katalog produk, troli beli-belah, integrasi get pembayaran, pengendalian inventori dan biasanya lebih banyak ujian untuk memastikan pembayaran berfungsi dengan boleh dipercayai — semua itu tambahan kerja pembinaan dan penyelenggaraan berbanding laman web statik yang bersifat maklumat sahaja.",
          },
          {
            question: "Adakah bayaran sekali sahaja mencukupi, atau ada kos berterusan?",
            answer:
              "Jangkakan kos berterusan tanpa mengira jenis pembinaan: pembaharuan hosting, pembaharuan domain, dan — jika anda mahu laman web diselenggara, dikemas kini dan dilindungi secara aktif — sama ada pelan penyelenggaraan atau masa anda sendiri untuk melakukannya.",
          },
        ],
        body: `## Apa sebenarnya yang menentukan harga

Kos laman web di Malaysia berbeza dengan ketara — dan penentu utamanya bukan hosting atau domain, tetapi **berapa banyak kerja tersuai yang diperlukan laman web itu**. Tiga peringkat ini merangkumi kebanyakan perniagaan kecil dan sederhana:

### 1. Laman web maklumat mudah
Beberapa halaman — laman utama, tentang kami, perkhidmatan, hubungi — biasanya dibina daripada templat dengan penjenamaan, kandungan dan imej anda. Ini sesuai untuk perniagaan yang matlamat utama laman webnya ialah "mudah ditemui dan kelihatan boleh dipercayai dalam talian", tanpa memerlukan tempahan, pembayaran atau akaun.

### 2. Laman web perniagaan reka bentuk tersuai
Susun atur dan reka bentuk sepenuhnya tersuai berbanding templat, selalunya dengan lebih banyak halaman, blog, dan perhatian lebih rapi terhadap cara laman web mewakili jenama khusus anda. Peringkat ini sesuai sebaik sahaja laman web anda menjadi sebahagian penting daripada cara pelanggan menilai anda sebelum menghubungi anda.

### 3. E-dagang atau aplikasi web
Katalog produk, troli beli-belah, integrasi get pembayaran, akaun pelanggan, inventori — ini pembinaan yang jauh lebih besar kerana pembayaran perlu berfungsi dengan boleh dipercayai, selamat, dan mengendalikan kes tepi (pembayaran gagal, stok kehabisan, bayaran balik).

## Apa yang disertakan selain reka bentuk itu sendiri

Sebut harga laman web patut mengambil kira lebih daripada sekadar halaman yang anda lihat:

- **Pendaftaran domain** — kos tahunan yang kecil, berasingan daripada pembinaan
- **Hosting** — berterusan, biasanya dibilkan setiap tahun atau setiap bulan
- **Sijil SSL** — patut disertakan percuma pada mana-mana pelan hosting yang bereputasi hari ini, bukan item berasingan
- **Responsif mudah alih** — tidak boleh dirunding pada 2026; laman web yang hanya berfungsi pada desktop pada dasarnya rosak untuk kebanyakan pelawat
- **Persediaan SEO asas di halaman** — tajuk halaman, penerangan dan peta laman, supaya laman web sebenarnya boleh diindeks oleh enjin carian sejak hari pertama

## Kos berterusan yang sering dilupakan orang

Pembinaan adalah kos sekali sahaja; mengekalkan laman web berjalan bukan:

- **Pembaharuan hosting**, biasanya tahunan
- **Pembaharuan domain**, biasanya tahunan, berasingan daripada hosting
- **Penyelenggaraan** — kemas kini plugin/perisian, sandaran, dan membaiki apa-apa yang rosak selepas kemas kini platform. Sama ada anda melakukannya sendiri, atau membayar untuk pelan penyelenggaraan; melangkau langkah ini sepenuhnya adalah bagaimana laman web secara senyap menjadi tidak selamat atau rosak dari semasa ke semasa.
- **Kemas kini kandungan** — menambah perkhidmatan, halaman atau catatan blog baharu seiring perkembangan perniagaan anda

## Cara membuat belanjawan dengan bijak

1. **Mulakan dengan peringkat yang sepadan dengan keperluan sebenar perniagaan anda hari ini** — anda sentiasa boleh menaik taraf laman web mudah kepada laman web tersuai kemudian; anda jarang perlu membina secara berlebihan pada hari pertama.
2. **Tanya dengan tepat apa yang disertakan dalam sebut harga** — hosting, domain, SSL, dan berapa banyak pusingan semakan, secara khusus.
3. **Buat belanjawan untuk tahun kedua, bukan sekadar tahun pertama** — pembaharuan hosting dan domain, ditambah penyelenggaraan jika anda mahukannya, adalah kos berulang yang tidak hilang selepas pelancaran.

Laman web yang tepat untuk kebanyakan PKS Malaysia bukanlah pilihan paling murah atau paling mahal — ia adalah peringkat yang sepadan dengan apa yang perniagaan itu benar-benar perlukan daripada laman webnya.`,
      },
      zh: {
        title: "在马来西亚建一个企业网站要多少钱？2026 年价格指南",
        excerpt: "从简单的单页网站到完整的电商建设——以下是真正决定马来西亚网站成本的因素，以及钱花在哪里。",
        metaTitle: "在马来西亚建企业网站要多少钱？（2026 年指南）",
        metaDescription: "拆解马来西亚企业网站成本的构成——设计、主机、域名与持续维护——助您准确制定预算。",
        focusKeyword: "企业网站成本 马来西亚",
        aiSummary:
          "马来西亚中小企业的基础网站成本通常远低于定制电商或网页应用的建设成本，因为成本差异主要来自定制页面数量、集成功能（如支付网关）和所需的持续维护——而非主机或域名费用，这部分只占总成本中较小且相对固定的一部分。",
        keyEntities: "网站成本, 网页设计报价, 电商网站, 域名注册费用, 主机费用, 网站维护",
        faqItems: [
          {
            question: "让企业网站上线最便宜的方式是什么？",
            answer:
              "一个域名加基础主机方案，再配上基于模板的单页或少量页面网站，是成本最低的路径——在这个层级，大部分持续成本来自主机和域名续费，而非设计费用。",
          },
          {
            question: "为什么电商网站比宣传型网站贵？",
            answer:
              "电商网站需要产品目录、购物车、支付网关集成、库存管理，通常还需要更多测试以确保结账流程稳定可靠——这些都是相较于静态信息展示网站额外增加的建设与维护工作。",
          },
          {
            question: "一次性付款就够了吗，还是有持续费用？",
            answer:
              "无论哪种建设方式，都应预留持续费用：主机续费、域名续费，以及——如果您希望网站得到持续维护、更新和安全防护——维护方案费用，或是您自己投入时间去处理。",
          },
        ],
        body: `## 真正决定价格的因素

马来西亚的网站成本差异很大——而最大的决定因素并非主机或域名，而是**网站需要多少定制工作**。以下三个层级涵盖了大多数中小企业的需求：

### 1. 简单的信息型网站
几个页面——首页、关于我们、服务、联系我们——通常基于模板搭建，加上您的品牌、内容和图片。这适合那些网站主要目标是"让客户容易找到、看起来可信"的企业，不需要预约、支付或账户功能。

### 2. 定制设计的企业网站
完全定制的布局与设计，而非模板，通常页面更多，带有博客，并更用心地体现您独特的品牌形象。当网站成为客户在联系您之前评估您的重要环节时，这个层级就值得投入。

### 3. 电商或网页应用
产品目录、购物车、支付网关集成、客户账户、库存管理——这是明显更大规模的建设，因为结账流程必须可靠、安全，并能处理各种边缘情况（支付失败、库存售罄、退款）。

## 报价中除设计本身外还应包含什么

一份网站报价应涵盖的不仅是您看到的页面：

- **域名注册**——一笔与建站费用分开的小额年费
- **主机托管**——持续性费用，通常按年或按月计费
- **SSL 证书**——如今任何靠谱的主机方案都应免费提供，而非单独收费项目
- **移动端适配**——2026 年这已是不可妥协的基本要求；只能在桌面端正常显示的网站，对大多数访客来说等于形同虚设
- **基础页面 SEO 设置**——页面标题、描述与网站地图，确保网站从上线第一天起就能被搜索引擎正常收录

## 大家常忽略的持续性成本

建站是一次性费用；维持网站运行则不是：

- **主机续费**，通常按年
- **域名续费**，通常按年，与主机费用分开
- **维护**——插件/软件更新、备份，以及在平台更新后修复出现的问题。要么自己动手，要么购买维护方案；完全跳过这一步，往往就是网站在不知不觉中变得不安全或出问题的原因。
- **内容更新**——随着企业发展，添加新服务、新页面或新的博客文章

## 如何理性制定预算

1. **从符合企业当下真实需求的层级开始**——您随时可以把简单网站升级为定制网站；很少有必要从一开始就过度建设。
2. **明确询问报价包含什么**——具体到主机、域名、SSL，以及修改次数。
3. **为第二年而非只为第一年做预算**——主机与域名续费，加上如果您需要的维护费用，都是上线后不会消失的持续性成本。

对大多数马来西亚中小企业而言，合适的网站既不是最便宜的，也不是最贵的选项——而是与企业真正需要网站完成的任务相匹配的那个层级。`,
      },
    },
  },
  {
    slug: "what-99-9-uptime-guarantee-means",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["uptime", "cloud-hosting", "security"],
    sourceCitations: [],
    locales: {
      en: {
        title: "What Does a \"99.9% Uptime Guarantee\" Actually Mean for Your Website?",
        excerpt:
          "99.9% sounds like a rounding error — but it adds up to real minutes of downtime a year. Here's what the number actually means, and what to check.",
        metaTitle: "What Does a 99.9% Uptime Guarantee Actually Mean?",
        metaDescription:
          "99.9% uptime still allows for downtime — here's exactly how much, what causes it, and what to check before trusting a host's uptime guarantee.",
        focusKeyword: "99.9% uptime guarantee meaning",
        aiSummary:
          "A 99.9% uptime guarantee allows for roughly 8.75 hours of downtime per year (about 43 minutes per month), which is why the exact percentage matters — the difference between 99.9% and 99.99% is the difference between hours and minutes of allowed downtime annually, and the value of the guarantee also depends on what the host actually does when they miss it.",
        keyEntities: "uptime guarantee, SLA, downtime, server monitoring, redundancy, hosting reliability",
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
      ms: {
        title: "Apakah Sebenarnya Maksud \"Jaminan Masa Tiada Gangguan 99.9%\" untuk Laman Web Anda?",
        excerpt:
          "99.9% kedengaran seperti pembundaran kecil — tetapi ia bersamaan dengan minit gangguan sebenar setahun. Berikut maksud sebenar angka itu, dan apa yang perlu disemak.",
        metaTitle: "Apakah Maksud Sebenar Jaminan Masa Tiada Gangguan 99.9%?",
        metaDescription:
          "99.9% masa beroperasi masih membenarkan gangguan — berikut jumlah sebenarnya, puncanya, dan apa yang perlu disemak sebelum mempercayai jaminan masa tiada gangguan penyedia hosting.",
        focusKeyword: "maksud jaminan masa tiada gangguan 99.9%",
        aiSummary:
          "Jaminan masa tiada gangguan 99.9% membenarkan lebih kurang 8.75 jam gangguan setahun (kira-kira 43 minit sebulan), itulah sebabnya peratusan tepat itu penting — perbezaan antara 99.9% dan 99.99% ialah perbezaan antara jam dan minit gangguan yang dibenarkan setahun, dan nilai jaminan itu juga bergantung pada apa sebenarnya yang dilakukan penyedia hosting apabila mereka gagal memenuhinya.",
        keyEntities: "jaminan masa tiada gangguan, SLA, masa gangguan, pemantauan pelayan, redundansi, kebolehpercayaan hosting",
        faqItems: [
          {
            question: "Berapakah masa gangguan yang sebenarnya dibenarkan oleh masa beroperasi 99.9%?",
            answer:
              "Kira-kira 8 jam 45 minit setahun, atau kira-kira 43 minit sebulan, dan kira-kira 1.4 minit sehari jika diagihkan secara sekata (pada realitinya, masa gangguan cenderung berlaku dalam beberapa insiden pendek sekali-sekala, bukannya diagihkan secara sekata).",
          },
          {
            question: "Adakah peratusan masa beroperasi yang lebih tinggi sentiasa berbaloi dibayar lebih?",
            answer:
              "Bagi kebanyakan laman web PKS, 99.9% adalah piawaian yang munasabah dan setanding industri. Beralih lebih tinggi (99.99%) kebanyakannya penting untuk perniagaan yang mana beberapa minit gangguan sahaja mempunyai kos langsung yang boleh diukur — contohnya e-dagang bervolum tinggi atau sistem tempahan sensitif masa.",
          },
          {
            question: "Apa lagi yang perlu saya semak selain peratusan masa beroperasi itu sendiri?",
            answer:
              "Tanya apa sebenarnya yang dilakukan penyedia hosting jika mereka gagal memenuhi jaminan (kredit perkhidmatan adalah piawaian), sama ada jaminan itu meliputi keseluruhan tindanan hosting atau sekadar perkakasan pelayan, dan sama ada mereka menerbitkan halaman status yang menunjukkan sejarah masa beroperasi sebenar.",
          },
        ],
        body: `## Angka yang kedengaran sempurna tetapi tidak

"99.9% masa beroperasi" kedengaran cukup hampir dengan sempurna sehingga mudah untuk dilangkau begitu sahaja. Tetapi 0.1% itu adalah masa gangguan sebenar yang dibenarkan — bukan ralat pembundaran. Berikut jumlahnya sebenarnya:

| Jaminan | Masa gangguan dibenarkan setahun | Sebulan | Seminggu |
|---|---|---|---|
| 99% | ~3.65 hari | ~7.3 jam | ~1.7 jam |
| **99.9%** | **~8.75 jam** | **~43.8 minit** | **~10.1 minit** |
| 99.95% | ~4.4 jam | ~21.9 minit | ~5 minit |
| 99.99% | ~52.5 minit | ~4.4 minit | ~1 minit |

Itulah sebabnya perbezaan antara 99% dan 99.9% sebenarnya sangat penting — ia perbezaan antara beberapa hari dan kurang sembilan jam masa gangguan dibenarkan setahun — manakala peralihan daripada 99.9% kepada 99.99% memberikan peningkatan mutlak yang jauh lebih kecil bagi kebanyakan perniagaan, dengan premium kos yang nyata.

## Dari mana sebenarnya masa gangguan datang

Jaminan masa tiada gangguan biasanya tentang infrastruktur hosting itu sendiri, tetapi masa gangguan dunia sebenar yang disedari perniagaan boleh datang daripada beberapa tempat:

- **Kegagalan perkakasan atau rangkaian** di pihak penyedia hosting — perkara yang sebenarnya dibincangkan oleh jaminan masa tiada gangguan
- **Penyelenggaraan berjadual** — penyedia hosting bereputasi melakukan ini dengan notis awal dan cuba meminimumkan kesan, tetapi ia masih dikira sebagai masa gangguan melainkan dikecualikan secara khusus
- **Laman web anda sendiri yang rosak** — kemas kini plugin yang buruk atau konfigurasi silap bukan salah penyedia hosting, dan tidak dilindungi oleh jaminan masa tiada gangguan mereka, walaupun ia kelihatan sama persis kepada pelawat
- **Isu DNS atau domain** — domain yang luput atau konfigurasi DNS yang silap menyebabkan laman terputus dengan cara yang tiada kaitan langsung dengan masa beroperasi hosting

Itulah sebabnya jaminan masa tiada gangguan, dengan sendirinya, tidak menjamin laman web anda sentiasa boleh dicapai — ia menjamin *infrastruktur hosting* memenuhi piawaian itu, yang masih menjadi asas kepada segala-galanya yang lain.

## Apa yang sebenarnya memberikan masa beroperasi dunia sebenar

Peratusan yang diterbitkan adalah janji; apa yang menjadikannya boleh dicapai ialah infrastruktur di sebaliknya:

- **Perkakasan berlebihan (redundan)** — tiada satu titik kegagalan yang menjatuhkan keseluruhan pelayan
- **Pemantauan aktif** — masalah dikesan dan ditangani dengan pantas, bukan ditemui apabila pelanggan mengadu
- **Infrastruktur awan/berimbang beban** dan bukannya satu pelayan fizikal, supaya satu kerosakan perkakasan tidak bersamaan dengan satu gangguan
- **Rekod prestasi yang benar-benar boleh disemak** — penyedia hosting dengan halaman status awam atau sejarah menepati jaminan adalah isyarat yang lebih kukuh berbanding angka itu sendiri

## Apa yang perlu ditanya sebelum mempercayai angka itu

1. **Apa yang berlaku jika mereka gagal memenuhinya?** Penyedia hosting bereputasi menawarkan kredit perkhidmatan untuk masa gangguan melebihi jaminan — jika tiada pemulihan yang dinyatakan, "jaminan" itu sebenarnya hanya dakwaan pemasaran.
2. **Adakah ia meliputi keseluruhan tindanan hosting, atau sekadar masa beroperasi pelayan asas?** Pelayan yang secara teknikal "beroperasi" tetapi dengan proses pelayan web yang terhempas bukan perbezaan yang bermakna kepada pelawat yang melihat halaman ralat.
3. **Adakah terdapat halaman status awam atau sejarah?** Jaminan hanya sebaik tindakan susulannya — minta untuk melihatnya, atau cari ulasan bebas yang menyebut gangguan sebenar.

Bagi kebanyakan laman web PKS Malaysia, jaminan 99.9% yang disampaikan dengan betul — disokong oleh infrastruktur berlebihan dan pemantauan sebenar — adalah piawaian yang kukuh dan mencukupi. Angka itu kurang penting berbanding sama ada penyedia hosting benar-benar boleh menyokongnya.`,
      },
      zh: {
        title: "\"99.9% 正常运行时间保证\"对您的网站到底意味着什么？",
        excerpt: "99.9% 听起来像个可以忽略的小数字——但换算下来每年仍有实实在在的停机时间。以下是这个数字的真正含义，以及您该检查什么。",
        metaTitle: "99.9% 正常运行时间保证到底意味着什么？",
        metaDescription: "99.9% 的正常运行时间仍然允许一定停机——本文告诉您具体是多少、原因是什么，以及在信任主机商的保证之前应检查哪些内容。",
        focusKeyword: "99.9%正常运行时间保证含义",
        aiSummary:
          "99.9% 的正常运行时间保证每年允许约 8.75 小时的停机（约每月 43 分钟），这正是为什么精确的百分比数字很重要——99.9% 与 99.99% 之间的差距，是每年允许停机以小时计还是以分钟计的差距，而这项保证的实际价值还取决于主机商未达标时具体会做什么。",
        keyEntities: "正常运行时间保证, SLA, 停机时间, 服务器监控, 冗余, 主机可靠性",
        faqItems: [
          {
            question: "99.9% 的正常运行时间实际允许多少停机？",
            answer:
              "每年约 8 小时 45 分钟，也就是每月约 43 分钟，若平均分摊则每天约 1.4 分钟（实际上，停机往往集中发生在少数几次短暂事件中，而不是均匀分布）。",
          },
          {
            question: "更高的正常运行时间百分比是否总是值得多花钱？",
            answer:
              "对大多数中小企业网站而言，99.9% 已是合理且符合行业标准的门槛。追求更高（99.99%）主要适用于哪怕几分钟停机都会造成可衡量直接损失的企业——例如高流量电商或时间敏感的预订系统。",
          },
          {
            question: "除了正常运行时间百分比本身，我还应该检查什么？",
            answer:
              "询问主机商未达标时具体会怎么处理（服务积分是行业标准做法），该保证覆盖的是整个主机技术栈还是仅服务器硬件本身，以及他们是否公开发布展示真实历史正常运行时间的状态页面。",
          },
        ],
        body: `## 听起来完美，实则不然的数字

"99.9% 正常运行时间"听起来已经接近完美，容易让人一扫而过。但那 0.1% 是真实存在、被允许的停机时间——不是四舍五入的误差。以下是具体换算：

| 保证等级 | 每年允许停机 | 每月 | 每周 |
|---|---|---|---|
| 99% | 约3.65天 | 约7.3小时 | 约1.7小时 |
| **99.9%** | **约8.75小时** | **约43.8分钟** | **约10.1分钟** |
| 99.95% | 约4.4小时 | 约21.9分钟 | 约5分钟 |
| 99.99% | 约52.5分钟 | 约4.4分钟 | 约1分钟 |

这就是为什么 99% 与 99.9% 之间的差距其实非常重要——那是每年允许停机"以天计"与"不到九小时"之间的区别——而从 99.9% 跃升到 99.99%，对大多数企业来说带来的绝对提升幅度小得多，代价却是实实在在的成本溢价。

## 停机究竟从何而来

正常运行时间保证通常只针对主机基础架构本身，但企业实际感受到的停机可能来自多个方面：

- **硬件或网络故障**——发生在主机商一侧，也正是正常运行时间保证真正涵盖的内容
- **计划性维护**——靠谱的主机商会提前通知并尽量降低影响，但除非明确排除，否则这仍算作停机
- **您自己网站出问题**——一次糟糕的插件更新或配置错误并非主机商的责任，也不在其正常运行时间保证范围内，尽管在访客看来两者毫无区别
- **DNS 或域名问题**——域名过期或 DNS 配置错误会导致网站离线，这与主机的正常运行时间毫无关系

这正是为什么正常运行时间保证本身并不能保证您的网站永远可访问——它保证的是*主机基础架构*达到该标准，而这仍然是其他一切得以运转的根基。

## 什么才能真正带来现实中的高可用性

公开的百分比只是一个承诺；真正让它得以实现的，是背后的基础架构：

- **冗余硬件**——不存在导致整台服务器宕机的单点故障
- **主动监控**——问题能被及时发现并处理，而不是等客户投诉才发现
- **云端/负载均衡架构**，而非单一物理服务器，这样一次硬件故障不会等同于一次全面停机
- **真正可核实的历史记录**——拥有公开状态页面或长期履约记录的主机商，是比数字本身更有力的信号

## 在信任这个数字之前该问的问题

1. **未达标时会怎样？** 靠谱的主机商会为超出保证的停机提供服务积分——如果没有明确的补偿机制，这个"保证"其实只是一句营销说辞。
2. **它覆盖整个主机技术栈，还是仅裸机服务器的正常运行？** 对访客来说，一台"技术上在线"但网页服务进程已崩溃的服务器，和真正的宕机没有任何区别——他们看到的都是错误页面。
3. **是否有公开的状态页面或历史记录？** 保证的可信度取决于是否真正兑现——不妨要求查看，或查找提及真实故障事件的独立评价。

对大多数马来西亚中小企业网站而言，一个真正落实到位的 99.9% 保证——由冗余基础架构和真实监控支撑——已是稳固且足够的标准。数字本身反而没有主机商是否真能兑现它来得重要。`,
      },
    },
  },
  {
    slug: "digital-business-cards-vs-paper-name-cards",
    categorySlug: "business-tips",
    categoryName: CATEGORIES["business-tips"],
    tagSlugs: ["digital-business-card", "malaysia-sme"],
    sourceCitations: [],
    locales: {
      en: {
        title: "Digital Business Cards vs Paper Name Cards: Why Malaysian SMEs Are Switching",
        excerpt:
          "Paper name cards run out, get lost, and go stale the moment your number changes. Here's what a digital business card actually solves.",
        metaTitle: "Digital Business Cards vs Paper Name Cards: What's the Difference?",
        metaDescription:
          "Digital business cards vs traditional paper name cards — cost, convenience, and why more Malaysian SMEs are making the switch.",
        focusKeyword: "digital business card vs paper name card",
        aiSummary:
          "A digital business card is a shareable online profile (via link or QR code) with your contact details, links, and branding, that can be updated instantly and saved straight into a phone's contacts — unlike a paper name card, which is fixed the moment it's printed and gets thrown away as often as it gets kept.",
        keyEntities: "digital business card, digital namecard, QR code, paper name card, networking, contact sharing",
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
      ms: {
        title: "Kad Nama Digital lwn Kad Nama Kertas: Mengapa PKS Malaysia Beralih",
        excerpt:
          "Kad nama kertas kehabisan, hilang, dan menjadi lapuk sebaik sahaja nombor anda bertukar. Berikut apa yang sebenarnya diselesaikan oleh kad nama digital.",
        metaTitle: "Kad Nama Digital lwn Kad Nama Kertas: Apakah Perbezaannya?",
        metaDescription: "Kad nama digital berbanding kad nama kertas tradisional — kos, kemudahan, dan mengapa semakin ramai PKS Malaysia beralih.",
        focusKeyword: "kad nama digital lwn kad nama kertas",
        aiSummary:
          "Kad nama digital ialah profil dalam talian yang boleh dikongsi (melalui pautan atau kod QR) dengan butiran hubungan, pautan dan penjenamaan anda, yang boleh dikemas kini serta-merta dan disimpan terus ke dalam kenalan telefon — berbeza dengan kad nama kertas, yang tetap sejak dicetak dan dibuang sebanyak ia disimpan.",
        keyEntities: "kad nama digital, digital namecard, kod QR, kad nama kertas, rangkaian perniagaan, perkongsian hubungan",
        faqItems: [
          {
            question: "Apakah sebenarnya kad nama digital?",
            answer:
              "Ia profil dalam talian — biasanya diakses melalui pautan atau kod QR — yang menyimpan nama, jawatan, syarikat, butiran hubungan dan pautan anda (laman web, media sosial, WhatsApp), yang mana orang yang anda kongsikan boleh melihat serta-merta dan menyimpan terus ke dalam kenalan telefon mereka.",
          },
          {
            question: "Bolehkah saya kemas kininya selepas mengedarkannya?",
            answer:
              "Ya — itulah kelebihan utamanya berbanding kertas. Jika nombor telefon atau jawatan anda bertukar, anda kemas kini kad digital itu sekali sahaja, dan semua orang yang mempunyai pautan atau kenalan yang disimpan itu akan melihat butiran terkini secara automatik, tanpa perlu mencetak semula apa-apa.",
          },
          {
            question: "Adakah saya masih perlukan kad nama kertas?",
            answer:
              "Tidak semestinya, tetapi sesetengah orang masih suka memberikan sesuatu yang fizikal semasa pertemuan pertama. Pendekatan biasa ialah kad fizikal yang minimalis dengan hanya kod QR yang membawa kepada profil digital penuh — menggabungkan penyerahan bersentuh yang biasa dengan kelebihan sentiasa terkini bagi versi digital.",
          },
        ],
        body: `## Masalah yang tidak pernah diselesaikan oleh kad nama kertas

Kad nama kertas selesai sebaik sahaja ia dicetak. Tukar nombor telefon, jawatan, atau alamat syarikat anda, dan setiap kad yang telah diedarkan kini salah — dan anda perlu membayar untuk mencetak kelompok baharu untuk memperbetulkannya.

Ada juga masalah yang lebih senyap: kebanyakan kad kertas hilang, dibuang, atau tersimpan dan dilupakan dalam laci sebelum sesiapa sempat bertindak atas maklumat hubungan itu. Meletakkan butiran anda di hadapan seseorang bukan sama dengan memastikan ia disimpan.

## Apa yang sebenarnya dilakukan oleh kad nama digital

Kad nama digital meletakkan maklumat yang sama — nama, jawatan, syarikat, telefon, e-mel, laman web, pautan media sosial — di sebalik satu pautan atau kod QR yang boleh dikongsi. Orang yang anda kongsikan boleh:

- **Melihatnya serta-merta** pada telefon mereka sendiri, tanpa perlu memasang apl
- **Menyimpannya terus ke dalam kenalan** dengan satu ketikan, dan bukannya menaip nombor anda secara manual
- **Sentiasa melihat butiran terkini anda**, kerana anda mengemas kini satu profil dalam talian sahaja dan bukannya mencetak semula apa-apa

Bagi pemilik perniagaan, ini juga bermakna anda boleh menjejaki cara kad itu digunakan — apabila perkhidmatan menyokongnya, anda boleh melihat berapa kali kad anda dilihat atau disimpan, sesuatu yang tidak dapat diberitahu oleh kad kertas.

## Di mana kad digital jelas menang

- **Acara rangkaian dan persidangan** — berkongsi kod QR lebih pantas daripada mencari-cari kad, dan ia tidak boleh kehabisan di tengah acara
- **Pasukan jualan** — kad setiap ahli pasukan kekal konsisten dan menepati jenama, dan mengemas kini butiran syarikat mengemas kini semua orang serentak
- **Perniagaan yang kerap menukar butiran** — nombor telefon baharu, alamat baharu, promosi bermusim — semuanya tidak memerlukan pencetakan semula
- **Sesiapa yang mahu kelihatan terkini** — kad digital menandakan perniagaan yang bersedia untuk cara orang benar-benar bertukar maklumat hubungan hari ini

## Di mana kad fizikal masih ada tempatnya

Sesetengah orang masih mengharapkan sesuatu yang fizikal diserahkan semasa pertemuan pertama — ia lebih kepada tabiat, bukan keperluan fungsian. Jalan tengah praktikal yang digunakan ramai PKS Malaysia: kad fizikal minimalis dengan nama anda dan kod QR, yang membawa kepada profil digital penuh. Anda mendapat penyerahan bersentuh yang biasa bagi orang, tanpa kehilangan kelebihan sentiasa terkini bagi versi digital.

## Kesimpulannya

Kad nama kertas belum lapuk sepenuhnya dalam sekelip mata, tetapi ia menyelesaikan kurang daripada masalah yang pernah diselesaikannya dahulu. Kad nama digital membaiki dua perkara yang secara struktural tidak boleh dilakukan oleh kertas: ia kekal terkini selepas diedarkan, dan ia menjadikan penyimpanan butiran anda tindakan satu ketikan dan bukannya sesuatu yang perlu diingati oleh orang lain kemudian.`,
      },
      zh: {
        title: "数字名片与传统纸质名片对比：马来西亚中小企业为何纷纷转换",
        excerpt: "纸质名片会用完、会遗失，而且只要您的电话号码一变就立刻过时。以下是数字名片真正解决的两大问题。",
        metaTitle: "数字名片与纸质名片：有何区别？",
        metaDescription: "数字名片对比传统纸质名片——成本、便利性，以及为何越来越多马来西亚中小企业选择转换。",
        focusKeyword: "数字名片对比纸质名片",
        aiSummary:
          "数字名片是一个可通过链接或二维码分享的在线资料页，包含您的联系方式、链接和品牌信息，可即时更新并一键存入手机通讯录——而纸质名片一旦印刷即固定不变，被丢弃的概率往往不亚于被保留的概率。",
        keyEntities: "数字名片, digital namecard, 二维码, 纸质名片, 商务社交, 联系方式分享",
        faqItems: [
          {
            question: "数字名片究竟是什么？",
            answer:
              "它是一个通常通过链接或二维码访问的在线资料页，保存您的姓名、职位、公司、联系方式以及各类链接（网站、社交媒体、WhatsApp），对方可以立即查看，并一键将其存入手机通讯录。",
          },
          {
            question: "分发之后还能修改吗？",
            answer:
              "可以——这正是它相较纸质名片的核心优势。如果您的电话号码或职位变更，只需更新这一份在线资料，所有拥有该链接或已保存联系人的人都会自动看到最新信息，无需重新印刷任何东西。",
          },
          {
            question: "我还需要纸质名片吗？",
            answer:
              "不一定，但有些人在初次见面时仍然习惯递上实体物品。一个常见做法是使用印有二维码的简约实体卡片，扫码即可跳转至完整的数字资料页——既保留了人们熟悉的实物递交仪式感，又不失数字版本始终保持最新的优势。",
          },
        ],
        body: `## 纸质名片从未真正解决的问题

纸质名片一旦印刷完成，就已经"定型"了。一旦您的电话号码、职位或公司地址发生变化，所有已经派发出去的名片瞬间全部过时——而您还得花钱重新印刷一批来纠正。

还有一个更隐蔽的问题：大多数纸质名片最终的结局要么是遗失、被丢弃，要么被塞进抽屉遗忘，根本没等到有人真正采取行动联系。把联系方式递到对方手中，和确保对方真的保存下来，完全是两回事。

## 数字名片真正做到了什么

数字名片将同样的信息——姓名、职位、公司、电话、邮箱、网站、社交媒体链接——整合在一个可分享的链接或二维码背后。您分享的对象可以：

- **立即在自己手机上查看**，无需安装任何应用
- **一键直接存入通讯录**，而不用手动逐字输入您的号码
- **始终看到您的最新信息**，因为您只需更新这一份在线资料，而不必重新印刷任何东西

对企业主而言，这还意味着您可以追踪名片的使用情况——在支持该功能的服务下，您可以查看名片被查看或保存的次数，这是纸质名片永远无法告诉您的信息。

## 数字名片明显占优的场景

- **社交活动与会议**——分享二维码比翻找名片更快，而且不会在活动进行到一半时用完
- **销售团队**——每位团队成员的名片保持一致、符合品牌形象，更新公司信息时所有人同步更新
- **经常变更信息的企业**——新电话号码、新地址、季节性促销——都无需重新印刷
- **希望展现与时俱进形象的企业**——数字名片体现出企业已适应当下人们交换联系方式的真实方式

## 实体名片仍有一席之地的场合

有些人在初次见面时仍习惯递上实物——这更多是一种习惯，而非功能上的必需。许多马来西亚中小企业采用的折中方案是：一张印有姓名和二维码的简约实体卡片，扫码即可跳转至完整的数字资料页。您既保留了人们习惯的实物递交环节，又不失数字版本始终保持最新的优势。

## 结语

纸质名片不会一夜之间被淘汰，但它能解决的问题已经比过去少了。数字名片弥补了纸质名片在结构上无法做到的两件事：分发之后依然能保持最新，并且让保存您的联系方式变成对方一键即可完成的动作，而不是需要事后凭记忆去补上的事情。`,
      },
    },
  },
  {
    slug: "website-speed-checklist-cpanel-litespeed",
    categorySlug: "hosting",
    categoryName: CATEGORIES.hosting,
    tagSlugs: ["website-speed", "cpanel", "litespeed"],
    sourceCitations: [{ label: "Google — Web Vitals", url: "https://web.dev/articles/vitals" }],
    locales: {
      en: {
        title: "Website Loading Slowly? A 7-Point Speed Checklist for cPanel + LiteSpeed Hosting",
        excerpt:
          "Before you blame your host, run through this checklist — most slow-loading business websites share the same handful of fixable causes.",
        metaTitle: "Website Loading Slowly? A 7-Point Speed Checklist",
        metaDescription:
          "A practical checklist for diagnosing a slow website on cPanel + LiteSpeed hosting — images, caching, plugins, and what to check first.",
        focusKeyword: "website speed checklist cPanel LiteSpeed",
        aiSummary:
          "Most slow business websites are slowed down by a small, predictable set of causes — oversized images, no caching, too many third-party scripts, and outdated plugins/themes — and checking those first resolves the majority of speed complaints, before assuming the hosting itself is the problem.",
        keyEntities: "website speed, page load time, LiteSpeed cache, image optimization, Core Web Vitals, cPanel hosting",
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
      ms: {
        title: "Laman Web Anda Lambat Dimuatkan? Senarai Semak 7 Perkara untuk Pengehosan cPanel + LiteSpeed",
        excerpt:
          "Sebelum anda menyalahkan penyedia hosting anda, semak senarai ini — kebanyakan laman web perniagaan yang lambat berkongsi punca yang sama dan boleh diperbaiki.",
        metaTitle: "Laman Web Lambat Dimuatkan? Senarai Semak 7 Perkara",
        metaDescription:
          "Senarai semak praktikal untuk mendiagnosis laman web yang lambat pada pengehosan cPanel + LiteSpeed — imej, cache, plugin, dan apa yang perlu disemak dahulu.",
        focusKeyword: "senarai semak kelajuan laman web cPanel LiteSpeed",
        aiSummary:
          "Kebanyakan laman web perniagaan yang lambat diperlahankan oleh set punca yang kecil dan boleh diramal — imej yang terlalu besar, tiada cache, terlalu banyak skrip pihak ketiga, dan plugin/tema yang lapuk — dan menyemak perkara ini dahulu menyelesaikan majoriti aduan kelajuan, sebelum menganggap hosting itu sendiri yang menjadi masalah.",
        keyEntities: "kelajuan laman web, masa muat halaman, cache LiteSpeed, pengoptimuman imej, Core Web Vitals, pengehosan cPanel",
        faqItems: [
          {
            question: "Adakah hosting saya sentiasa punca laman web saya lambat?",
            answer:
              "Tidak selalunya. Hosting menetapkan siling sejauh mana laman web *boleh* menjadi pantas, tetapi imej yang terlalu besar, kod yang tidak dioptimumkan, dan terlalu banyak skrip pihak ketiga lebih kerap menjadi kesesakan sebenar — malah hosting yang baik pun tidak dapat memperbaiki laman web yang tidak dioptimumkan.",
          },
          {
            question: "Apakah pembaikan berkesan paling tinggi untuk kebanyakan laman web?",
            answer:
              "Pengoptimuman imej. Foto resolusi penuh yang tidak dimampatkan, dimuat naik terus daripada telefon atau kamera, adalah punca tunggal paling biasa laman web dimuatkan perlahan pada laman web perniagaan kecil.",
          },
          {
            question: "Adakah LiteSpeed benar-benar memberikan perbezaan yang boleh diukur berbanding Apache?",
            answer:
              "Ya, terutamanya di bawah trafik serentak — LiteSpeed dibina untuk mengendalikan ramai pelawat serentak dengan lebih cekap berbanding persediaan Apache biasa pada perkakasan yang sama, ditambah pula ia disepadukan dengan LiteSpeed Cache untuk caching peringkat halaman yang tidak ditawarkan Apache secara asli.",
          },
        ],
        body: `## Sebelum anda menyalahkan penyedia hosting anda

Laman web yang lambat memang mengecewakan, dan hosting selalunya menjadi kambing hitam pertama yang disyaki — tetapi pada realitinya, kebanyakan laman web perniagaan yang lambat berkongsi beberapa punca sama yang boleh diperbaiki, tiada kaitan dengan pelayan itu sendiri. Semak senarai ini sebelum menganggap anda perlu menaik taraf hosting.

### 1. Semak imej anda dahulu

Ini punca paling biasa untuk halaman yang lambat. Foto terus daripada kamera telefon moden boleh dengan mudah bersaiz beberapa megabait — bagi laman web, ia sepatutnya biasanya jauh di bawah 300KB selepas disaiz semula dan dimampatkan. Saiz semula imej mengikut dimensi sebenar ia akan dipaparkan, dan mampatkannya melalui alat mampatan sebelum memuat naik.

### 2. Aktifkan caching

Tanpa caching, pelayan anda membina semula setiap halaman dari awal pada setiap kunjungan. Caching menyimpan versi halaman yang sedia dihidangkan dan memberikannya serta-merta sebaliknya. Jika anda menggunakan pengehosan LiteSpeed, **LiteSpeed Cache** dibina khusus untuk ini dan berbaloi disahkan sama ada ia benar-benar diaktifkan — ini antara pembaikan berimpak tinggi dan berusaha rendah yang tersedia.

### 3. Audit plugin dan skrip anda

Setiap plugin, skrip penjejakan, dan widget terbenam menambah masa muat. Semak semua plugin dan kandungan terbenam pihak ketiga laman web anda (widget sembang, suapan media sosial, alat analitik) dan buang apa-apa yang anda tidak benar-benar gunakan atau manfaatkan. Adalah biasa untuk menemui plugin yang dipasang sekali untuk keperluan tertentu dan tidak pernah dibuang.

### 4. Kekalkan platform dan tema anda dikemas kini

Perisian CMS, tema dan plugin yang lapuk bukan sekadar risiko keselamatan — versi lebih lama selalunya kurang cekap berbanding versi terkini. Kemas kini selalunya turut membawa penambahbaikan prestasi sebenar bersama pembaikan keselamatan.

### 5. Minimumkan pengalihan

Setiap pengalihan (url-lama → url-baharu) menambah satu pusingan tambahan sebelum halaman itu boleh mula dimuatkan. Beberapa pengalihan tidak akan ketara, tetapi rantaian beberapa pengalihan yang bertindih dengan ketara memperlahankan bait pertama yang diterima pelawat.

### 6. Semak sama ada sumber hosting anda sepadan dengan laman web anda

Jika anda pada pelan pengehosan kongsi asas dan laman web anda telah berkembang — lebih banyak kandungan, lebih banyak trafik, kedai dalam talian — pelan itu sendiri mungkin benar-benar kekurangan sumber sekarang, walaupun ia memadai semasa pelancaran. Inilah titik di mana beralih kepada pengehosan awan (lihat panduan kami tentang [pengehosan awan lwn kongsi](/blog/cloud-hosting-vs-shared-hosting-malaysia/)) mula penting.

### 7. Uji daripada sambungan sebenar, bukan sekadar wifi pejabat anda

Peranti anda sendiri mungkin mempunyai aset yang dicache atau sambungan yang pantas yang tidak mewakili pelawat sebenar anda. Uji menggunakan alat yang mensimulasikan pelawat baharu pada sambungan mudah alih biasa — itu penghampiran yang jauh lebih dekat kepada apa yang benar-benar dialami kebanyakan pelanggan anda.

## Menggabungkan semuanya

Lalui item 1–5 dahulu — ia percuma, dalam kawalan anda, dan menyelesaikan sebahagian besar aduan kelajuan pada laman web perniagaan. Jika laman web masih perlahan selepas itu, item 6 (sumber hosting) ialah perkara jujur seterusnya yang perlu disemak, bukannya yang pertama.`,
      },
      zh: {
        title: "网站加载缓慢？cPanel + LiteSpeed 主机的 7 点速度检查清单",
        excerpt: "在责怪主机商之前，先过一遍这份清单——大多数加载缓慢的企业网站，背后都是同一批可修复的常见原因。",
        metaTitle: "网站加载缓慢？7 点速度检查清单",
        metaDescription: "在 cPanel + LiteSpeed 主机上诊断网站速度慢的实用清单——图片、缓存、插件，以及应优先检查的事项。",
        focusKeyword: "网站速度检查清单 cPanel LiteSpeed",
        aiSummary:
          "大多数速度慢的企业网站，都是被一小组可预测的原因拖慢的——图片过大、缺少缓存、第三方脚本过多以及插件/主题过时——优先排查这些原因就能解决大部分速度问题投诉，而不是一开始就归咎于主机本身。",
        keyEntities: "网站速度, 页面加载时间, LiteSpeed 缓存, 图片优化, Core Web Vitals, cPanel 主机",
        faqItems: [
          {
            question: "网站慢是不是一定是主机的问题？",
            answer:
              "通常不是。主机决定了网站*可能*达到的速度上限，但图片过大、代码未优化以及第三方脚本过多，往往才是真正的瓶颈——即便主机再好，也无法弥补一个未经优化的网站。",
          },
          {
            question: "对大多数网站来说，性价比最高的改进是什么？",
            answer: "图片优化。直接从手机或相机上传、未经压缩的全分辨率照片，是中小企业网站加载缓慢最常见的单一原因。",
          },
          {
            question: "LiteSpeed 相比 Apache 真的有实质差距吗？",
            answer:
              "是的，尤其是在并发流量较高的情况下——LiteSpeed 在相同硬件上处理大量并发访客的效率明显优于原生 Apache 配置，而且它还能配合 LiteSpeed Cache 实现页面级缓存，这是 Apache 原生不具备的能力。",
          },
        ],
        body: `## 在责怪主机商之前

网站慢确实令人沮丧，主机往往是人们第一个怀疑的对象——但实际上，大多数速度慢的企业网站背后是同一批可修复的常见原因，与服务器本身无关。在认定需要升级主机之前，先过一遍这份清单。

### 1. 先检查您的图片

这是导致页面缓慢最常见的原因。现代手机相机直接拍出的照片轻易就有好几兆字节——对网站而言，经过调整尺寸和压缩后，通常应远低于 300KB。请将图片调整到实际显示所需的尺寸，并在上传前用压缩工具处理一遍。

### 2. 开启缓存

没有缓存的情况下，服务器每次访问都要从头重新生成整个页面。缓存会存储一份可直接提供的页面版本，并立即返回给访客。如果您使用的是 LiteSpeed 主机，**LiteSpeed Cache** 正是为此而生，值得确认它确实已经启用——这是投入最少、效果最显著的改进之一。

### 3. 审查插件与脚本

每一个插件、追踪脚本和嵌入式小工具都会增加加载时间。逐一检查网站的插件和第三方嵌入内容（聊天工具、社交媒体信息流、分析工具），移除任何您实际上没有使用或没有从中受益的项目。经常会发现某个插件是因一次性需求而安装、之后却从未被移除。

### 4. 保持平台与主题为最新版本

过时的 CMS 软件、主题和插件不仅是安全隐患——旧版本往往效率也不如新版本。更新常常在修复安全漏洞的同时，也带来实质的性能提升。

### 5. 减少跳转（重定向）

每一次跳转（旧网址 → 新网址）都会在页面开始加载前增加一次额外的往返请求。少数几个跳转不会有明显影响，但一连串叠加的跳转链会明显拖慢访客收到首字节数据的速度。

### 6. 检查主机资源是否与网站规模相匹配

如果您使用的是基础共享主机方案，而网站已经成长——内容更多、流量更大、开了在线商店——即便上线时够用，现在这个方案本身可能确实资源不足了。这正是切换到云主机开始变得重要的节点（参见我们的[云主机与共享主机对比](/blog/cloud-hosting-vs-shared-hosting-malaysia/)指南）。

### 7. 用真实网络环境测试，而非只用办公室 Wi-Fi

您自己的设备可能已缓存了部分资源，或网络速度较快，并不能代表真实访客的体验。使用能模拟移动网络下新访客的工具进行测试，这样得到的结果才更接近大多数客户的真实体验。

## 综合运用

先完成第 1–5 项——它们免费、完全在您掌控之内，能解决企业网站上绝大多数的速度问题投诉。如果这之后网站仍然缓慢，第 6 项（主机资源）才是接下来该诚实面对的问题，而不是第一个该怀疑的对象。`,
      },
    },
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

  for (const group of POSTS) {
    const categoryId = categoryCache.get(group.categorySlug);
    const tagIds = group.tagSlugs.map((s) => tagCache.get(s)).filter((id): id is string => Boolean(id));
    const sourceCitations = group.sourceCitations.length ? JSON.stringify(group.sourceCitations) : null;

    for (const locale of LOCALES) {
      const c = group.locales[locale];

      const shared = {
        type: "POST" as const,
        status: "PUBLISHED" as const,
        locale,
        title: c.title,
        excerpt: c.excerpt,
        body: c.body,
        categoryId,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        focusKeyword: c.focusKeyword,
        aiSummary: c.aiSummary,
        keyEntities: c.keyEntities,
        sourceCitations,
        lastFactCheckedAt: new Date(),
      };

      const existing = await prisma.content.findUnique({
        where: { slug_locale: { slug: group.slug, locale } },
      });
      let id: string;

      if (existing) {
        await prisma.content.update({
          where: { slug_locale: { slug: group.slug, locale } },
          data: shared,
        });
        id = existing.id;
        console.log(`Updated: ${group.slug} [${locale}]`);
      } else {
        const created = await prisma.content.create({
          data: {
            ...shared,
            slug: group.slug,
            publishedAt: new Date(),
            authorId: admin?.id,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
            faqItems: {
              create: c.faqItems.map((f, i) => ({ question: f.question, answer: f.answer, order: i })),
            },
          },
        });
        id = created.id;
        console.log(`Created: ${group.slug} [${locale}]`);
      }

      // Mirrors what the admin's save action does: write this post to the
      // linked static site (public_html/blog/, /ms/blog/, /zh/blog/) if
      // STATIC_SITE_DIR is configured. A no-op when it isn't set.
      await syncContentToStaticSite(id);
    }
  }

  await regenerateAllBlogIndexes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
