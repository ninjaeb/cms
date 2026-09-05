"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string; slug: string; description: string | null };

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description: "" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to create category.");
      return;
    }
    const created = await res.json();
    setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setSlug("");
    setSlugTouched(false);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this category? Content using it will become uncategorized.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreate}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Name</label>
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="input w-48"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Slug</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="input w-48"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add category
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 text-neutral-900">{cat.name}</td>
                <td className="px-4 py-3 text-neutral-500">/{cat.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
