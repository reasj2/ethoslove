import { expect, test } from "@playwright/test";

test("homepage renders the hero in English", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("open again and again");
  await expect(page.getByRole("link", { name: /make a gift/i }).first()).toBeVisible();
});

test("Spanish homepage is served at /es", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("una y otra vez");
});

test("gift links never redirect by browser language", async ({ page }) => {
  // An unknown gift is a 404 (or 200 with no database), but the URL must stay put —
  // never a locale redirect, since these links live on printed cards.
  const response = await page.goto("/g/abc123def");
  expect([200, 404]).toContain(response?.status());
  expect(page.url()).toMatch(/\/g\/abc123def$/);
});

test("unknown pages show the localised 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("404")).toBeVisible();
});
