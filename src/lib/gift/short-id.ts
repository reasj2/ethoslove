import { customAlphabet } from "nanoid";
import { SHORT_ID_LENGTH } from "@/config/site";

/** Unambiguous lowercase alphabet (no 0/o, 1/l/i) — these get read off printed cards. */
export const SHORT_ID_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const generateShortId = customAlphabet(SHORT_ID_ALPHABET, SHORT_ID_LENGTH);

export const SHORT_ID_PATTERN = new RegExp(`^[${SHORT_ID_ALPHABET}]{${SHORT_ID_LENGTH}}$`);

export function isShortId(value: string): boolean {
  return SHORT_ID_PATTERN.test(value);
}
