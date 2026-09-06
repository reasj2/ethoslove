import { z } from "zod";

export const fieldsSchema = z.object({
  wall: z.enum(["plaster", "charcoal", "sage"]).default("plaster"),
  exhibition: z.string().max(60).optional(),
  /** Printed on every plaque, e.g. "2021–2026". */
  years: z.string().max(20).optional(),
  frame: z.enum(["oak", "black", "gilt"]).default("oak"),
});

export type MuseumFields = z.infer<typeof fieldsSchema>;
