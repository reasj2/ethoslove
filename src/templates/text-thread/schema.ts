import { z } from "zod";

export const fieldsSchema = z.object({
  /** One bubble per line. A line that is exactly "[photo]" inserts the next photo. */
  lines: z.array(z.string().trim().min(1).max(280)).min(2).max(40).default([]),
  contactName: z.string().max(40).optional(),
  bubble: z.enum(["ink", "blue", "green", "coral"]).default("ink"),
  showTyping: z.boolean().default(true),
});

export type ThreadFields = z.infer<typeof fieldsSchema>;
