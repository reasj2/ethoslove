import { z } from "zod";

export const fieldsSchema = z.object({
  /** Number of candles (also shown on the marquee when set). */
  age: z.number().int().min(1).max(120).optional(),
  marquee: z.string().max(40).optional(),
  curtain: z.enum(["crimson", "midnight", "emerald"]).default("crimson"),
  /** How the candles go out. "auto" tries the microphone first, then falls back to a swipe. */
  blow: z.enum(["auto", "swipe"]).default("auto"),
});

export type CinemaFields = z.infer<typeof fieldsSchema>;
