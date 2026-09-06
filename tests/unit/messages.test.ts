import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

function flatten(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" ? flatten(value as Record<string, unknown>, path) : [path];
  });
}

describe("message catalogues", () => {
  it("en and es expose exactly the same keys", () => {
    const enKeys = flatten(en).sort();
    const esKeys = flatten(es).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("interpolation variables match between locales", () => {
    const vars = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
    const walk = (a: Record<string, unknown>, b: Record<string, unknown>, path = "") => {
      for (const key of Object.keys(a)) {
        const va = a[key];
        const vb = b[key];
        if (typeof va === "string" && typeof vb === "string") {
          expect(vars(vb), `${path}${key}`).toEqual(vars(va));
        } else if (va && typeof va === "object") {
          walk(va as Record<string, unknown>, (vb ?? {}) as Record<string, unknown>, `${path}${key}.`);
        }
      }
    };
    walk(en, es);
  });
});
