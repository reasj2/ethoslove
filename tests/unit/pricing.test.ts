import { describe, expect, it } from "vitest";
import { PRODUCTS, PRODUCT_ORDER, currencyFor, formatAmount, hasUnlock, unlocksFor } from "@/lib/pricing/products";

describe("pricing catalogue", () => {
  it("undercuts the competitor on the all-access tier and has three cards", () => {
    expect(PRODUCT_ORDER).toEqual(["single", "pick3", "everything"]);
    expect(PRODUCTS.everything.amounts.usd).toBeLessThan(2799);
    expect(PRODUCTS.everything.highlight).toBe(true);
    expect(PRODUCTS.pick3.compareAt!.usd).toBe(3 * PRODUCTS.single.amounts.usd);
  });
  it("formats money per locale", () => {
    expect(formatAmount(799, "usd")).toBe("$7.99");
    expect(formatAmount(749, "eur", "es")).toMatch(/7,49/);
  });
  it("guesses currency from region", () => {
    expect(currencyFor("es-ES")).toBe("eur");
    expect(currencyFor("GB")).toBe("gbp");
    expect(currencyFor("en-US")).toBe("usd");
    expect(currencyFor(null)).toBe("usd");
  });
  it("turns products into unlock rows", () => {
    expect(unlocksFor("everything", [])).toEqual(["*"]);
    expect(unlocksFor("single", ["the-letter"])).toEqual(["the-letter"]);
    expect(unlocksFor("pick3", ["a", "b", "c"])).toEqual(["a", "b", "c"]);
    expect(() => unlocksFor("pick3", ["a", "a", "b"])).toThrow();
    expect(() => unlocksFor("single", [])).toThrow();
  });
  it("checks entitlement", () => {
    expect(hasUnlock(["*"], "anything")).toBe(true);
    expect(hasUnlock(["the-letter"], "the-letter")).toBe(true);
    expect(hasUnlock(["the-letter"], "vinyl")).toBe(false);
  });
});
