import { z } from "zod";

export const fieldsSchema = z.object({
  album: z.string().max(40).optional(),
  artist: z.string().max(40).optional(),
  sleeve: z.enum(["black", "cream", "burgundy"]).default("cream"),
  /** Side A / B labels printed on the record label. */
  side: z.string().max(12).default("Side A"),
});

export type VinylFields = z.infer<typeof fieldsSchema>;
