import { describe, expect, it } from "vitest";
import { isoToWallTime, wallTimeToIso, zoneOffsetMinutes } from "@/lib/editor/time";

describe("zoned time helpers", () => {
  it("converts Madrid wall time in summer and winter", () => {
    expect(wallTimeToIso("2027-06-14T00:00", "Europe/Madrid")).toBe("2027-06-14T00:00:00+02:00");
    expect(wallTimeToIso("2027-01-14T09:30", "Europe/Madrid")).toBe("2027-01-14T09:30:00+01:00");
  });
  it("round-trips through New York", () => {
    const iso = wallTimeToIso("2026-12-20T18:30", "America/New_York")!;
    expect(iso).toBe("2026-12-20T18:30:00-05:00");
    expect(isoToWallTime(iso, "America/New_York")).toBe("2026-12-20T18:30");
  });
  it("knows UTC has no offset", () => {
    expect(zoneOffsetMinutes(new Date("2026-06-01T00:00:00Z"), "UTC")).toBe(0);
  });
});
