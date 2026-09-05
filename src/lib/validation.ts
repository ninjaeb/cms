import { z } from "zod";

export const settingsSchema = z.object({
  scanRootDir: z.string().max(1000),
  enableAiRecommendations: z.boolean(),
});

export const scanRequestSchema = z.object({
  rootDir: z.string().min(1).max(1000).optional(),
});
