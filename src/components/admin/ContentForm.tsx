"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { computeSeoChecklist, type Citation } from "@/lib/seo";

type Option = { id: string; name: string };

export type ContentFormInitial = {
  id?: string;
  type: "POST" | "PAGE";
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage: string;
  categoryId: string;
  tagIds: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  focusKeyword: string;
  ogImage: string;
  noindex: boolean;
  nofollow: boolean;
  aiSummary: string;
  keyEntities: string;
  sourceCitations: Citation[];
  lastFactCheckedAt: string;
  faqItems: { question: string; answer: string }[];
};

const EMPTY: ContentFormInitial = {
  type: "POST",
  status: "DRAFT",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  featuredImage: "",
  categoryId: "",
  tagIds: [],
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  focusKeyword: "",
  ogImage: "",
  noindex: false,
  nofollow: false,
  aiSummary: "",
  keyEntities: "",
  sourceCitations: [],
  lastFactCheckedAt: "",
  faqItems: [],
};

export default function ContentForm({
  categories,
  tags,
  initial,
}: {
  categories: Option[];
  tags: Option[];
  initial?: ContentFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ContentFormInitial>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checklist = useMemo(
    () =>
      computeSeoChecklist({
        title: form.title,
        slug: form.slug,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        focusKeyword: form.focusKeyword || null,
        featuredImage: form.featuredImage || null,
        body: form.body,
        aiSummary: form.aiSummary || null,
        keyEntities: form.keyEntities || null,
        sourceCitations: form.sourceCitations.length ? JSON.stringify(form.sourceCitations) : null,
        lastFactCheckedAt: form.lastFactCheckedAt ? new Date(form.lastFactCheckedAt) : null,
        faqItemCount: form.faqItems.length,
      }),
    [form],
  );

  const seoItems = checklist.filter((c) => c.group === "seo");
  const geoItems = checklist.filter((c) => c.group === "geo");
  const seoScore = Math.round((seoItems.filter((i) => i.passed).length / seoItems.length) * 100);
  const geoScore = Math.round((geoItems.filter((i) => i.passed).length / geoItems.length) * 100);

  function update<K extends keyof ContentFormInitial>(key: K, value: ContentFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onTitleChange(value: string) {
    update("title", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  function toggleTag(id: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id],
    }));
  }

  function addFaq() {
    update("faqItems", [...form.faqItems, { question: "", answer: "" }]);
  }
  function updateFaq(i: number, key: "question" | "answer", value: string) {
    const next = [...form.faqItems];
    next[i] = { ...next[i], [key]: value };
    update("faqItems", next);
  }
  function removeFaq(i: number) {
    update(
      "faqItems",
      form.faqItems.filter((_, idx) => idx !== i),
    );
  }

  function addCitation() {
    update("sourceCitations", [...form.sourceCitations, { label: "", url: "" }]);
  }
  function updateCitation(i: number, key: "label" | "url", value: string) {
    const next = [...form.sourceCitations];
    next[i] = { ...next[i], [key]: value };
    update("sourceCitations", next);
  }
  function removeCitation(i: number) {
    update(
      "sourceCitations",
      form.sourceCitations.filter((_, idx) => idx !== i),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      type: form.type,
      status: form.status,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      body: form.body,
      featuredImage: form.featuredImage || null,
      categoryId: form.categoryId || null,
      tagIds: form.tagIds,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      canonicalUrl: form.canonicalUrl || null,
      focusKeyword: form.focusKeyword || null,
      ogImage: form.ogImage || null,
      noindex: form.noindex,
      nofollow: form.nofollow,
      aiSummary: form.aiSummary || null,
      keyEntities: form.keyEntities || null,
      sourceCitations: form.sourceCitations.filter((c) => c.label && c.url),
      lastFactCheckedAt: form.lastFactCheckedAt || null,
      faqItems: form.faqItems.filter((f) => f.question && f.answer),
    };

    const res = await fetch(isEdit ? `/api/content/${initial!.id}` : "/api/content", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save content.");
      return;
    }
    router.push("/admin/content");
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm("Delete this content permanently?")) return;
    await fetch(`/api/content/${initial.id}`, { method: "DELETE" });
    router.push("/admin/content");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Section title="Content">
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Slug">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">/</span>
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", slugify(e.target.value));
                }}
                className="input"
              />
            </div>
          </Field>
          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="input"
            />
          </Field>
          <Field label="Body (Markdown)">
            <textarea
              required
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              rows={16}
              className="input font-mono text-sm"
            />
          </Field>
          <Field label="Featured image URL">
            <input
              value={form.featuredImage}
              onChange={(e) => update("featuredImage", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          </Field>
        </Section>

        <Section
          title="GEO — Generative Engine Optimization"
          description="Helps AI answer engines (ChatGPT, Claude, Perplexity, AI Overviews) understand, summarize, and cite this content accurately."
        >
          <Field
            label="AI summary"
            hint="A concise, factual, answer-first summary an AI system can quote directly."
          >
            <textarea
              value={form.aiSummary}
              onChange={(e) => update("aiSummary", e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
          <Field label="Key entities / topics" hint="Comma-separated.">
            <input
              value={form.keyEntities}
              onChange={(e) => update("keyEntities", e.target.value)}
              className="input"
              placeholder="e.g. GEO, SEO, structured data"
            />
          </Field>
          <Field label="Last fact-checked">
            <input
              type="date"
              value={form.lastFactCheckedAt}
              onChange={(e) => update("lastFactCheckedAt", e.target.value)}
              className="input max-w-xs"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Source citations</p>
              <button type="button" onClick={addCitation} className="text-sm text-neutral-600 hover:underline">
                + Add citation
              </button>
            </div>
            <div className="space-y-2">
              {form.sourceCitations.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={c.label}
                    onChange={(e) => updateCitation(i, "label", e.target.value)}
                    placeholder="Source name"
                    className="input"
                  />
                  <input
                    value={c.url}
                    onChange={(e) => updateCitation(i, "url", e.target.value)}
                    placeholder="https://…"
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => removeCitation(i)}
                    className="shrink-0 rounded-md px-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">FAQ (renders as FAQPage schema)</p>
              <button type="button" onClick={addFaq} className="text-sm text-neutral-600 hover:underline">
                + Add question
              </button>
            </div>
            <div className="space-y-3">
              {form.faqItems.map((f, i) => (
                <div key={i} className="rounded-md border border-neutral-200 p-3">
                  <input
                    value={f.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder="Question"
                    className="input mb-2"
                  />
                  <textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder="Answer"
                    rows={2}
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Traditional SEO">
          <Field label="Meta title" hint="Falls back to Title if empty.">
            <input
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Meta description">
            <textarea
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={2}
              className="input"
            />
          </Field>
          <Field label="Focus keyword">
            <input
              value={form.focusKeyword}
              onChange={(e) => update("focusKeyword", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Canonical URL" hint="Leave empty to use this page's own URL.">
            <input
              value={form.canonicalUrl}
              onChange={(e) => update("canonicalUrl", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Open Graph image URL" hint="Falls back to featured image if empty.">
            <input
              value={form.ogImage}
              onChange={(e) => update("ogImage", e.target.value)}
              className="input"
            />
          </Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => update("noindex", e.target.checked)}
              />
              noindex
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.nofollow}
                onChange={(e) => update("nofollow", e.target.checked)}
              />
              nofollow
            </label>
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Publish">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as "POST" | "PAGE")}
              className="input"
            >
              <option value="POST">Post</option>
              <option value="PAGE">Page</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as "DRAFT" | "PUBLISHED" | "SCHEDULED")
              }
              className="input"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </Field>
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="input"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p className="mb-1 text-sm font-medium text-neutral-700">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    form.tagIds.includes(t.id)
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-600"
                  }`}
                >
                  {t.name}
                </button>
              ))}
              {tags.length === 0 && <p className="text-xs text-neutral-400">No tags yet.</p>}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </Section>

        <Section title="SEO score" description={`${seoScore}% of on-page SEO checks pass.`}>
          <ScoreBar score={seoScore} />
          <ChecklistList items={seoItems} />
        </Section>

        <Section title="GEO score" description={`${geoScore}% of AI-readiness checks pass.`}>
          <ScoreBar score={geoScore} />
          <ChecklistList items={geoItems} />
        </Section>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description && <p className="mb-4 mt-1 text-sm text-neutral-500">{description}</p>}
      <div className={description ? "space-y-4" : "mt-4 space-y-4"}>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function ChecklistList({
  items,
}: {
  items: { id: string; label: string; passed: boolean; hint: string }[];
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex gap-2 text-sm">
          <span className={item.passed ? "text-green-600" : "text-neutral-300"}>
            {item.passed ? "✓" : "○"}
          </span>
          <div>
            <p className={item.passed ? "text-neutral-700" : "text-neutral-500"}>{item.label}</p>
            <p className="text-xs text-neutral-400">{item.hint}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
