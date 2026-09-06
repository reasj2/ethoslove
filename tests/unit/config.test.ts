import { describe, expect, it } from "vitest";
import { OCCASIONS, OCCASION_META, isOccasion } from "@/config/occasions";
import { routing } from "@/i18n/routing";
import en from "../../messages/en.json";

describe("occasions", () => {
  it("every occasion has metadata and a translation", () => {
    for (const o of OCCASIONS) {
      expect(OCCASION_META[o]).toBeDefined();
      expect((en.occasions as Record<string, string>)[o]).toBeTypeOf("string");
    }
  });
  it("isOccasion guards unknown slugs", () => {
    expect(isOccasion("birthday")).toBe(true);
    expect(isOccasion("nope")).toBe(false);
  });
});

describe("routing", () => {
  it("defaults to English without a prefix", () => {
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localePrefix).toBe("as-needed");
  });
});
