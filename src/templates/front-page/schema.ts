import { z } from "zod";

export const fieldsSchema = z.object({
  /** Masthead, e.g. "The Daily Ana". Defaults to "The Daily {name}". */
  paperName: z.string().max(40).optional(),
  headline: z.string().max(80).optional(),
  subhead: z.string().max(140).optional(),
  weather: z.string().max(80).optional(),
  /** Classified ads — one per line, the sillier the better. */
  ads: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
  horoscope: z.string().max(200).optional(),
  price: z.string().max(20).optional(),
  ink: z.enum(["black", "navy", "sepia"]).default("black"),
});

export type FrontPageFields = z.infer<typeof fieldsSchema>;
