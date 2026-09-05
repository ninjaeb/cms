"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

type Tag = { id: string; name: string; slug: string };

export default function TagManager({ initial }: { initial: Tag[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to create tag.");
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
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
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
          Add tag
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="flex flex-wrap gap-2">
        {items.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700"
          >
            {tag.name}
            <button onClick={() => onDelete(tag.id)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No tags yet.</p>}
      </div>
    </div>
  );
}
