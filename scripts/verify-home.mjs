import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => errors.push(`${name} pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${name} console: ${m.text().slice(0, 300)}`));
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(out, `home-${name}-top.png`) });
  await page.screenshot({ path: join(out, `home-${name}-full.png`), fullPage: true });
  await page.close();
}
await browser.close();
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
