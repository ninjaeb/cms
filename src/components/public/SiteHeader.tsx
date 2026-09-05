import Link from "next/link";

export default function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          {siteName}
        </Link>
      </div>
    </header>
  );
}
