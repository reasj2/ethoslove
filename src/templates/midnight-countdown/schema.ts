import { z } from "zod";

export const fieldsSchema = z.object({
  skyline: z.enum(["city", "sea", "mountains"]).default("city"),
  /** Shown above the timer, e.g. "Until you're 30". */
  headline: z.string().max(60).optional(),
  /** Line that appears with the fireworks. */
  zeroLine: z.string().max(60).optional(),
});

export type MidnightFields = z.infer<typeof fieldsSchema>;
