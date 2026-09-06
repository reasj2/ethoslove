import { z } from "zod";

export const fieldsSchema = z.object({
  reasons: z.array(z.string().trim().min(1).max(160)).min(3).max(100).default([]),
  label: z.string().max(40).optional(),
  paper: z.enum(["white", "kraft", "pastel"]).default("white"),
});

export type JarFields = z.infer<typeof fieldsSchema>;
