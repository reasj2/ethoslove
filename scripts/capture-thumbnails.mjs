/**
 * Captures a poster frame (JPG) and a short muted preview (WebM) for every template.
 * Requires the dev server:  npm run dev   then   node scripts/capture-thumbnails.mjs
 */
import { chromium, devices } from "@playwright/test";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3000";
const W = 390;
const H = 600;

const SCRIPTS = {
  "the-letter": async (page) => {
    await page.getByRole("button", { name: /tap the seal/i }).waitFor({ timeout: 15000 });
    await page.waitForTimeout(1400);
    const poster = await page.screenshot();
    await page.getByRole("button", { name: /tap the seal/i }).click({ force: true });
    await page.waitForTimeout(6500);
    return poster;
  },
  constellations: async (page) => {
    await page.locator("[data-star]").first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(1500);
    const poster = await page.screenshot();
    for (let i = 0; i < 3; i++) {
      await page.locator(`[data-star="${i}"]`).click();
      await page.waitForTimeout(1500);
      await page.getByTestId("close-photo").click();
      await page.waitForTimeout(1000);
    }
    return poster;
  },
};

const browser = await chromium.launch();
for (const [slug, run] of Object.entries(SCRIPTS)) {
  const dir = join("public/templates", slug);
  mkdirSync(dir, { recursive: true });
  const videoDir = join(".tmp-video", slug);
  rmSync(videoDir, { recursive: true, force: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: { width: W, height: H },
    locale: "en-US",
    recordVideo: { dir: videoDir, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  await page.goto(`${base}/demo/${slug}`, { waitUntil: "networkidle" });
  // Page chrome and the dev indicator do not belong in marketing assets.
  await page.addStyleTag({
    content: 'a[href*="/templates/"], a[href="/?ref=watermark"], nextjs-portal { display: none !important; }',
  });
  const poster = await run(page);
  await sharp(poster).jpeg({ quality: 82, mozjpeg: true }).toFile(join(dir, "poster.jpg"));
  await context.close();
  const [video] = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  renameSync(join(videoDir, video), join(dir, "preview.webm"));
  console.log("captured", slug);
}
rmSync(".tmp-video", { recursive: true, force: true });
await browser.close();
