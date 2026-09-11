import { describe, expect, it } from "vitest";
import { REF_PATTERN, currentRef, rememberRef } from "@/lib/attribution/ref";

describe("checkout attribution ref", () => {
  it("keeps the last valid ?ref=, lower-cased, and ignores anything else", () => {
    expect(currentRef()).toBeUndefined();
    rememberRef("?ref=TT-Couple");
    expect(currentRef()).toBe("tt-couple");
    rememberRef("?ref=not%20a%20ref!");
    rememberRef("?utm_source=tiktok");
    rememberRef("");
    expect(currentRef()).toBe("tt-couple");
    // A gift's short id, from its "make your own" button.
    rememberRef("?ref=jayandmya");
    expect(currentRef()).toBe("jayandmya");
  });

  it("caps a ref at 40 characters", () => {
    expect(REF_PATTERN.test("a".repeat(40))).toBe(true);
    expect(REF_PATTERN.test("a".repeat(41))).toBe(false);
  });
});
