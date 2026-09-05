"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Redirect = { id: string; fromPath: string; toPath: string; statusCode: number };

export default function RedirectManager({ initial }: { initial: Redirect[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState(301);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPath, toPath, statusCode }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to create redirect.");
      return;
    }
    const created = await res.json();
    setItems((prev) => [...prev, created]);
    setFromPath("");
    setToPath("");
    setStatusCode(301);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this redirect?")) return;
    await fetch(`/api/redirects/${id}`, { method: "DELETE" });
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
          <label className="mb-1 block text-xs font-medium text-neutral-700">From path</label>
          <input
            required
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
            placeholder="/old-url"
            className="input w-48"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">To path / URL</label>
          <input
            required
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
            placeholder="/new-url or https://…"
            className="input w-64"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">Status</label>
          <select
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
            className="input w-28"
          >
            <option value={301}>301</option>
            <option value={302}>302</option>
            <option value={307}>307</option>
            <option value={308}>308</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add redirect
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-neutral-900">{r.fromPath}</td>
                <td className="px-4 py-3 text-neutral-500">{r.toPath}</td>
                <td className="px-4 py-3 text-neutral-500">{r.statusCode}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(r.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No redirects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
