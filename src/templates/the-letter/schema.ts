import { z } from "zod";
import { HEX_COLOR } from "@/lib/gift/schema";

export const fieldsSchema = z.object({
  /** Letter pressed into the wax. Defaults to the sender's initial. */
  sealInitial: z.string().trim().max(2).optional(),
  paper: z.enum(["cream", "white", "kraft"]).default("cream"),
  desk: z.enum(["walnut", "linen", "slate"]).default("walnut"),
  inkColor: z.string().regex(HEX_COLOR).default("#2B2A4C"),
  /** Overrides "Dear {name},". */
  greeting: z.string().max(60).optional(),
  /** e.g. "With all my love," */
  signOff: z.string().max(60).optional(),
});

export type LetterFields = z.infer<typeof fieldsSchema>;
