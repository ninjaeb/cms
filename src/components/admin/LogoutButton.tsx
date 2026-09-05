"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-neutral-500 hover:bg-neutral-100"
    >
      Sign out
    </button>
  );
}
