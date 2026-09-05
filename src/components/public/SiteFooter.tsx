export default function SiteFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="mt-16 border-t border-neutral-200 py-8">
      <div className="mx-auto max-w-3xl px-4 text-sm text-neutral-500">
        <p>
          © {new Date().getFullYear()} {siteName}
        </p>
        <p className="mt-1">
          <a href="/llms.txt" className="hover:underline">
            llms.txt
          </a>{" "}
          ·{" "}
          <a href="/sitemap.xml" className="hover:underline">
            sitemap.xml
          </a>{" "}
          ·{" "}
          <a href="/robots.txt" className="hover:underline">
            robots.txt
          </a>
        </p>
      </div>
    </footer>
  );
}
