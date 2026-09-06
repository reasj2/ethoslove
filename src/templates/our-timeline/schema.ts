import { z } from "zod";

export const fieldsSchema = z.object({
  /** One label per photo, in order (e.g. "June 2021", "The first flat"). Extra entries are ignored. */
  dates: z.array(z.string().trim().max(40)).max(20).default([]),
  road: z.enum(["asphalt", "chalk", "ink"]).default("ink"),
  /** Closing line before the countdown. */
  ending: z.string().max(80).optional(),
});

export type TimelineFields = z.infer<typeof fieldsSchema>;
