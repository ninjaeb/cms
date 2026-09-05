import { z } from "zod";

export const citationSchema = z.object({
  label: z.string().min(1).max(200),
  url: z.string().url(),
});

export const faqItemSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
});

export const contentSchema = z.object({
  type: z.enum(["POST", "PAGE"]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(500).nullable().optional(),
  body: z.string().min(1),
  featuredImage: z.string().url().nullable().optional().or(z.literal("")),
  publishedAt: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).default([]),

  metaTitle: z.string().max(200).nullable().optional().or(z.literal("")),
  metaDescription: z.string().max(300).nullable().optional().or(z.literal("")),
  canonicalUrl: z.string().nullable().optional().or(z.literal("")),
  focusKeyword: z.string().max(150).nullable().optional().or(z.literal("")),
  ogImage: z.string().nullable().optional().or(z.literal("")),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),

  aiSummary: z.string().max(600).nullable().optional().or(z.literal("")),
  keyEntities: z.string().max(500).nullable().optional().or(z.literal("")),
  sourceCitations: z.array(citationSchema).default([]),
  lastFactCheckedAt: z.string().nullable().optional(),
  faqItems: z.array(faqItemSchema).default([]),
});

export type ContentInput = z.infer<typeof contentSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).nullable().optional().or(z.literal("")),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export const redirectSchema = z.object({
  fromPath: z.string().min(1).max(300).startsWith("/"),
  toPath: z.string().min(1).max(500),
  statusCode: z.number().int().refine((v) => [301, 302, 307, 308].includes(v)),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1).max(200),
  siteDescription: z.string().max(500),
  siteUrl: z.string().url(),
  organizationName: z.string().max(200),
  organizationLogo: z.string().max(500),
  defaultOgImage: z.string().max(500),
  twitterHandle: z.string().max(50),
  allowAiCrawlers: z.boolean(),
  llmsTxtIntro: z.string().max(2000),
});
