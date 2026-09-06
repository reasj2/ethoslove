/** Full-page screenshots of the marketing pages after a scroll-through: node scripts/shoot-pages.mjs <outDir> [tag] */
import { chromium } from "@playwright/test";
const out = process.argv[2]; const tag = process.argv[3] ?? "v2";
const b = await chromium.launch();
const shots = [["home", "/"], ["templates", "/templates"], ["pricing", "/pricing"], ["detail", "/templates/passport"], ["login", "/login"]];
const errors = [];
for (const [w, h, vp] of [[1440, 900, "desk"], [390, 844, "mob"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => errors.push(`${vp} pageerror: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errors.push(`${vp} console: ${m.text().slice(0, 160)}`));
  for (const [n, path] of shots) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // scroll through so whileInView sections reveal, then back to top
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += h * 0.7) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(140); }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/${n}-${vp}-${tag}.png`, fullPage: true });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errors.push(`${vp} ${path}: horizontal overflow ${overflow}px`);
  }
  await p.close();
}
await b.close();
console.log(errors.length ? "ISSUES:\n" + errors.join("\n") : "no page errors, no overflow");
