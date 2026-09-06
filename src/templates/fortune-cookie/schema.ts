import { z } from "zod";

export const fieldsSchema = z.object({
  fortunes: z.array(z.string().trim().min(1).max(140)).min(3).max(20).default([]),
  /** e.g. "14 · 06 · 21 · 7 · 42" */
  luckyNumbers: z.string().max(40).optional(),
  table: z.enum(["red", "jade", "linen"]).default("red"),
});

export type FortuneFields = z.infer<typeof fieldsSchema>;
