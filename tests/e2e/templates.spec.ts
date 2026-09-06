import { expect, test } from "@playwright/test";

test.describe("template engine", () => {
  test("gallery lists both launch templates with live demos", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.getByRole("heading", { name: "The Letter" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Constellations" })).toBeVisible();
  });

  test("The Letter opens from the seal to the signed letter", async ({ page }) => {
    await page.goto("/demo/the-letter");
    const loading = page.getByText(/someone made this for you, ana/i);
    await expect(loading).toBeVisible();
    await expect(loading).toBeHidden({ timeout: 20000 });
    const seal = page.getByRole("button", { name: /tap the seal/i });
    await expect(seal).toBeVisible();
    // The seal "breathes" forever, so Playwright never sees it as stable; force is intended here.
    await seal.click({ force: true });
    await expect(page.getByText(/dear ana/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Marco", { exact: true })).toBeVisible({ timeout: 60000 });
  });

  test("Constellations completes when every star is visited", async ({ page }) => {
    await page.goto("/demo/constellations");
    const stars = page.locator("[data-star]");
    await expect(stars.first()).toBeVisible({ timeout: 15000 });
    const count = await stars.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i++) {
      await page.locator(`[data-star="${i}"]`).click();
      await page.waitForTimeout(600);
      await page.getByTestId("close-photo").click();
      await page.waitForTimeout(600);
    }
    await expect(page.getByRole("button", { name: /continue/i })).toBeVisible({ timeout: 15000 });
  });
});
