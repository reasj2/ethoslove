import { z } from "zod";

export const fieldsSchema = z.object({
  foil: z.enum(["silver", "gold", "rose", "holo"]).default("gold"),
  /** Printed on the foil of every card. */
  foilText: z.string().max(30).optional(),
  /** Big line on the final card, above the message. */
  finalTitle: z.string().max(60).optional(),
});

export type ScratchFields = z.infer<typeof fieldsSchema>;
