import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/scan", label: "Scan" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-white p-4 sm:block">
          <div className="mb-6 px-2">
            <p className="text-sm font-semibold text-neutral-900">SEO/GEO Scanner</p>
            <p className="text-xs text-neutral-500">{session.name}</p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-1 border-t border-neutral-200 pt-4">
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
