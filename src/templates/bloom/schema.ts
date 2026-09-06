import { z } from "zod";

export const fieldsSchema = z.object({
  flower: z.enum(["peony", "tulip", "daisy"]).default("peony"),
  /** Petal colour; defaults to the gift accent. */
  petalColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  sky: z.enum(["dawn", "dusk", "paper"]).default("dawn"),
  pollen: z.boolean().default(true),
});

export type BloomFields = z.infer<typeof fieldsSchema>;
