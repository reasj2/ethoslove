/**
 * Drives both templates headlessly at phone size and saves screenshots.
 *   node scripts/verify-templates.mjs [outDir] [baseURL] [letter|stars|all]
 */
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
const which = process.argv[4] ?? "all";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 13"], locale: "en-US", reducedMotion: "no-preference" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
const shot = (name) => page.screenshot({ path: join(out, `${name}.png`) });

async function letter() {
  await page.goto(`${base}/demo/the-letter`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("letter-01-loading");
  const seal = page.getByRole("button", { name: /tap the seal/i });
  await seal.waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await shot("letter-02-envelope");
  await seal.click({ force: true });
  await page.waitForTimeout(1200);
  await shot("letter-03-opening");
  await page.waitForTimeout(1600);
  await shot("letter-04-unfolding");
  await page.getByText(/Dear Ana/).waitFor({ timeout: 10000 });
  await page.waitForTimeout(3500);
  await shot("letter-05-typing");
  await page.getByText("Marco", { exact: true }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
  await shot("letter-06-signed");
  const scroller = page.locator('[class*="scroller"]').first();
  await scroller.evaluate((el) => el.scrollBy({ top: 620, behavior: "instant" }));
  await page.waitForTimeout(1800);
  await shot("letter-07-polaroids");
  await scroller.evaluate((el) => el.scrollBy({ top: 900, behavior: "instant" }));
  await page.waitForTimeout(1200);
  await shot("letter-08-countdown-surprise");
  await scroller.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1200);
  await shot("letter-09-end");
}

async function stars() {
  await page.goto(`${base}/demo/constellations`, { waitUntil: "networkidle" });
  await page.locator("[data-star]").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await shot("stars-01-intro");
  const count = await page.locator("[data-star]").count();
  for (let i = 0; i < count; i++) {
    await page.locator(`[data-star="${i}"]`).click();
    await page.waitForTimeout(1300);
    if (i === 0) await shot("stars-02-photo");
    // Close by tapping the overlay (anywhere that is not the star buttons).
    await page.getByTestId("close-photo").click();
    await page.waitForTimeout(1500);
    if (i === 0) await shot("stars-02b-after-close");
    if (i === 2) await shot("stars-03-links");
    const remaining = await page.locator("[data-star]").count();
    console.log(`after star ${i}: ${remaining} star buttons, errors=${errors.length}`);
  }
  await page.waitForTimeout(3200);
  await shot("stars-04-complete");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(3000);
  await shot("stars-05-message");
  await page.getByText("— Lucas").waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
  await shot("stars-06-signed");
  const panel = page.locator(".overflow-y-auto").last();
  await panel.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1200);
  await shot("stars-07-end");
}

try {
  if (which === "all" || which === "letter") await letter();
  if (which === "all" || which === "stars") await stars();
} catch (e) {
  console.error("WALKTHROUGH FAILED:", e.message.split("\n")[0]);
  await shot("zz-failure");
} finally {
  console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
  await browser.close();
}
