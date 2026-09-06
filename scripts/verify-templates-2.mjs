/** Headless walkthrough of the second template batch. */
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
const only = process.argv[4];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 13"], locale: "en-US" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 300)}`));
const shot = (n) => page.screenshot({ path: join(out, `${n}.png`) });
const go = async (slug) => {
  await page.goto(`${base}/demo/${slug}`, { waitUntil: "networkidle" });
  await page.getByText(/someone made this for you/i).waitFor({ timeout: 15000 });
  await page.getByText(/someone made this for you/i).waitFor({ state: "hidden", timeout: 25000 });
  await page.waitForTimeout(800);
};

if (!only || only === "cinema") {
  await go("birthday-cinema");
  await shot("cinema-01-curtains");
  await page.getByRole("button", { name: /tap to start/i }).click({ force: true });
  await page.waitForTimeout(2200);
  await shot("cinema-02-cake");
  // swipe up to blow, three times
  for (let i = 0; i < 8; i++) {
    if (await page.getByText(/happy birthday/i).isVisible().catch(() => false)) break;
    await page.mouse.move(190, 600);
    await page.mouse.down();
    await page.mouse.move(190, 380, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  await shot("cinema-03-out");
  await page.getByText(/dear ana/i).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot("cinema-04-film");
}

if (!only || only === "jar") {
  await go("jar-of-reasons");
  await shot("jar-01-jar");
  await page.getByRole("button", { name: /pull another/i }).click();
  await page.waitForTimeout(1200);
  await shot("jar-02-note");
  await page.mouse.click(195, 632);
  await page.waitForTimeout(700);
  for (let i = 0; i < 11; i++) {
    await page.getByRole("button", { name: /pull another/i }).click();
    await page.waitForTimeout(350);
    await page.mouse.click(195, 632);
    await page.waitForTimeout(350);
  }
  await shot("jar-03-empty");
  await page.getByRole("button", { name: /read the letter/i }).click();
  await page.waitForTimeout(1500);
  await shot("jar-04-letter");
}

if (!only || only === "scratch") {
  await go("scratch-card");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.waitForTimeout(800);
  await shot("scratch-01-card");
  const scratchAll = async () => {
    const canvas = page.locator("canvas[role=img]").first();
    const box = await canvas.boundingBox();
    if (!box) return;
    for (let row = 0; row < 8; row++) {
      const y = box.y + 20 + (row / 7) * (box.height - 40);
      await page.mouse.move(box.x + 10, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 10, y, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForTimeout(700);
  };
  await scratchAll();
  await shot("scratch-02-revealed");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /next card|the last one/i }).click();
    await page.waitForTimeout(700);
    await scratchAll();
  }
  await shot("scratch-03-final");
}

if (!only || only === "midnight") {
  await go("midnight-countdown");
  await shot("midnight-01-countdown");
  await page.getByRole("button", { name: /tap to start/i }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /skip to midnight/i }).click();
  await page.waitForTimeout(2200);
  await shot("midnight-02-fireworks");
  await page.getByText(/dear ana/i).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1800);
  await shot("midnight-03-gift");
}

if (!only || only === "timeline") {
  await go("our-timeline");
  await shot("timeline-01-cover");
  await page.getByRole("button", { name: /scroll to begin/i }).click();
  await page.waitForTimeout(1200);
  const sc = page.locator(".overflow-y-auto").first();
  for (let i = 0; i < 8; i++) {
    await sc.evaluate((el) => el.scrollBy({ top: el.clientHeight * 0.9, behavior: "instant" }));
    await page.waitForTimeout(500);
    if (i === 2) await shot("timeline-02-milestone");
  }
  await page.waitForTimeout(1500);
  await shot("timeline-03-ending");
}

if (!only || only === "vinyl") {
  await go("vinyl");
  await shot("vinyl-01-turntable");
  await page.getByRole("button", { name: /drop the needle/i }).click();
  await page.waitForTimeout(1800);
  await shot("vinyl-02-playing");
  const sc = page.locator(".overflow-y-auto").first();
  await sc.evaluate((el) => el.scrollBy({ top: 700, behavior: "instant" }));
  await page.waitForTimeout(1500);
  await shot("vinyl-03-crate");
}

if (!only || only === "museum") {
  await go("museum");
  await shot("museum-01-entrance");
  await page.getByRole("button", { name: /^enter$/i }).click();
  await page.waitForTimeout(1500);
  await shot("museum-02-room");
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: /next room/i }).first().click().catch(() => {});
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(1500);
  await shot("museum-03-walltext");
}

await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
