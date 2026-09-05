"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  organizationName: string;
  organizationLogo: string;
  defaultOgImage: string;
  twitterHandle: string;
  allowAiCrawlers: boolean;
  llmsTxtIntro: string;
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold text-neutral-900">Site</h2>
        <div className="mt-4 space-y-4">
          <F label="Site name">
            <input
              value={form.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              className="input"
            />
          </F>
          <F label="Site description">
            <textarea
              value={form.siteDescription}
              onChange={(e) => update("siteDescription", e.target.value)}
              rows={2}
              className="input"
            />
          </F>
          <F label="Site URL" hint="Used for canonical URLs, sitemap, and structured data.">
            <input
              value={form.siteUrl}
              onChange={(e) => update("siteUrl", e.target.value)}
              className="input"
            />
          </F>
          <F label="Default social share image">
            <input
              value={form.defaultOgImage}
              onChange={(e) => update("defaultOgImage", e.target.value)}
              className="input"
            />
          </F>
          <F label="Twitter/X handle">
            <input
              value={form.twitterHandle}
              onChange={(e) => update("twitterHandle", e.target.value)}
              className="input"
              placeholder="@yoursite"
            />
          </F>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold text-neutral-900">Organization (structured data)</h2>
        <div className="mt-4 space-y-4">
          <F label="Organization name">
            <input
              value={form.organizationName}
              onChange={(e) => update("organizationName", e.target.value)}
              className="input"
            />
          </F>
          <F label="Organization logo URL">
            <input
              value={form.organizationLogo}
              onChange={(e) => update("organizationLogo", e.target.value)}
              className="input"
            />
          </F>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-semibold text-neutral-900">GEO — AI crawler access</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.allowAiCrawlers}
              onChange={(e) => update("allowAiCrawlers", e.target.checked)}
            />
            Allow known AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, …) in
            robots.txt
          </label>
          <F
            label="llms.txt introduction"
            hint="Shown at the top of /llms.txt, a plain-text index AI systems can use to discover your content."
          >
            <textarea
              value={form.llmsTxtIntro}
              onChange={(e) => update("llmsTxtIntro", e.target.value)}
              rows={3}
              className="input"
            />
          </F>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
      </div>
    </form>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
