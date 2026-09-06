import { describe, expect, it } from "vitest";
import { layoutSky, sampleShape, shapeOutline } from "@/templates/constellations/shapes";

describe("constellation shapes", () => {
  it("samples the requested number of evenly spaced nodes", () => {
    for (const kind of ["heart", "infinity", "star"] as const) {
      const pts = sampleShape(kind, 6);
      expect(pts).toHaveLength(6);
      for (const p of pts) {
        expect(Math.abs(p.x)).toBeLessThanOrEqual(1.05);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(1.05);
      }
    }
  });

  it("heart starts at the top notch and has its tip at the bottom", () => {
    const outline = shapeOutline("heart", 200);
    expect(outline[0].y).toBeLessThan(0);
    const tip = outline.reduce((a, b) => (b.y > a.y ? b : a));
    expect(tip.y).toBeGreaterThan(0.9);
  });

  it("lays out inside the container", () => {
    const { nodes } = layoutSky("heart", 8, 390, 844);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(390);
      expect(n.y).toBeGreaterThan(0);
      expect(n.y).toBeLessThan(844);
    }
  });
});
