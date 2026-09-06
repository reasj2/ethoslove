/** Headless smoke test of the editor: fill, preview, reload, persist. */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: "en-US" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));

await page.goto(`${base}/create/the-letter`, { waitUntil: "networkidle" });
await page.getByLabel("Their name").waitFor({ timeout: 20000 });
await page.getByLabel("Their name").fill("Ana");
await page.getByLabel("Your name").fill("Marco");
await page.getByLabel("Message").fill("Three years ago you asked if the seat next to me was taken. **It wasn't.**");
await page.waitForTimeout(800);
await page.screenshot({ path: join(out, "editor-01-filled.png") });
// preview shows the greeting
await page.getByText("Dear Ana,").first().waitFor({ timeout: 10000 });
// add a photo from the demo set
const input = page.locator('input[type="file"]').first();
await input.setInputFiles("public/demo/photos/p1.webp");
await page.locator('[class*="polaroid"], img[alt]').first().waitFor({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.screenshot({ path: join(out, "editor-02-photo.png") });
// reload → draft restored from localStorage + IndexedDB
await page.reload({ waitUntil: "networkidle" });
await page.getByLabel("Their name").waitFor({ timeout: 20000 });
const name = await page.getByLabel("Their name").inputValue();
const photoCount = await page.locator("li img").count();
console.log("restored name:", name, "| photos restored:", photoCount);
await page.screenshot({ path: join(out, "editor-03-restored.png") });
// open publish sheet (signed out → sign-in prompt)
await page.getByRole("button", { name: "Publish" }).click();
await page.getByText("Sign in to publish").waitFor({ timeout: 10000 });
await page.screenshot({ path: join(out, "editor-04-publish.png") });
// mobile layout
await page.setViewportSize({ width: 390, height: 844 });
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
await page.screenshot({ path: join(out, "editor-05-mobile.png") });
await page.getByRole("tab", { name: "Preview" }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: join(out, "editor-06-mobile-preview.png") });
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
