import { describe, expect, it } from "vitest";
import { describeObjectSchema } from "@/lib/editor/zod-describe";
import { fieldsSchema as letterFields } from "@/templates/the-letter/schema";
import { fieldsSchema as starFields } from "@/templates/constellations/schema";
import { fieldsSchema as jarFields } from "@/templates/jar-of-reasons/schema";

describe("zod introspection", () => {
  it("describes The Letter fields", () => {
    const d = Object.fromEntries(describeObjectSchema(letterFields).map((f) => [f.key, f]));
    expect(d.paper).toMatchObject({ widget: "select", options: ["cream", "white", "kraft"], defaultValue: "cream" });
    expect(d.inkColor).toMatchObject({ widget: "color", defaultValue: "#2B2A4C" });
    expect(d.sealInitial).toMatchObject({ widget: "text", optional: true, maxLength: 2 });
  });
  it("describes Constellations fields", () => {
    const d = Object.fromEntries(describeObjectSchema(starFields).map((f) => [f.key, f]));
    expect(d.shape).toMatchObject({ widget: "select", options: ["heart", "infinity", "star"] });
    expect(d.finalLine).toMatchObject({ widget: "text", optional: true, maxLength: 120 });
  });
  it("describes list fields with item limits", () => {
    const d = Object.fromEntries(describeObjectSchema(jarFields).map((f) => [f.key, f]));
    expect(d.reasons).toMatchObject({ widget: "list", minItems: 3, maxItems: 100, itemMaxLength: 160 });
  });
});
