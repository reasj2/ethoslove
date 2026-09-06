import { z } from "zod";

export const fieldsSchema = z.object({
  item: z.enum(["heart", "star", "cake"]).default("heart"),
  /** Catches needed per level. */
  perLevel: z.number().int().min(3).max(20).default(8),
  crt: z.boolean().default(true),
  title: z.string().max(24).optional(),
});

export type ArcadeFields = z.infer<typeof fieldsSchema>;
