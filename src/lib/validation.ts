import { z } from "zod";

export const settingsSchema = z.object({
  scanBaseUrl: z.string().max(1000),
  enableAiRecommendations: z.boolean(),
});

export const scanRequestSchema = z.object({
  baseUrl: z.string().min(1).max(1000).url().optional(),
});
