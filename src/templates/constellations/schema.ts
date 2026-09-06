import { z } from "zod";

export const fieldsSchema = z.object({
  sky: z.enum(["midnight", "aurora", "dawn"]).default("midnight"),
  shape: z.enum(["heart", "infinity", "star"]).default("heart"),
  /** Shown when the constellation completes. */
  finalLine: z.string().max(120).optional(),
});

export type ConstellationFields = z.infer<typeof fieldsSchema>;
