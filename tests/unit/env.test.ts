import { describe, expect, it } from "vitest";
import { isConfigured } from "@/lib/env";

describe("env", () => {
  it("reports nothing configured in a bare environment", () => {
    expect(isConfigured.supabase).toBe(false);
    expect(isConfigured.stripe).toBe(false);
  });
});
