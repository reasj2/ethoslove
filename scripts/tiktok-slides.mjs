/**
 * Renders iMessage-style chat slides (1080×1920, dark mode) for TikTok photo carousels from a
 * script JSON. Uses the Mac's system font through Chromium, so the type is the real thing.
 *   node scripts/tiktok-slides.mjs docs/marketing/tiktok-01/script.json docs/marketing/tiktok-01
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [scriptPath, outDir] = [process.argv[2], process.argv[3] ?? "."];
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
mkdirSync(outDir, { recursive: true });

const SEAL = `<svg viewBox="0 0 32 32" width="96" height="96"><path d="M16 2.5c1.3 0 2 1.2 3.3 1.5s2.6-.5 3.7.3 1 2.2 1.9 3.2 2.4 1.2 2.9 2.4-.3 2.5 0 3.8 1.6 2.1 1.6 3.4-1.3 2.1-1.6 3.4.5 2.7 0 3.8-2 1.5-2.9 2.4-.8 2.5-1.9 3.2-2.4-.1-3.7.3S17.3 32 16 32s-2-1.2-3.3-1.5-2.6.5-3.7-.3-1-2.2-1.9-3.2-2.4-1.2-2.9-2.4.3-2.5 0-3.8S2.5 18.7 2.5 17.4s1.3-2.1 1.6-3.4-.5-2.7 0-3.8 2-1.5 2.9-2.4.8-2.5 1.9-3.2 2.4.1 3.7-.3S14.7 2.5 16 2.5Z" fill="#c63d22"/><path d="M16 10.2c-1.9-2.4-5.6-1.8-6.4 1.2-.6 2.3.9 4.2 2.7 5.8l3.7 3.3 3.7-3.3c1.8-1.6 3.3-3.5 2.7-5.8-.8-3-4.5-3.6-6.4-1.2Z" fill="#fbf6ee" opacity=".95"/></svg>`;

const HEART = `<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.6 4.5 6.4 4.5c2 0 3.6 1.1 5.6 3.3 2-2.2 3.6-3.3 5.6-3.3 3.8 0 5.5 4 4 7.3C19.5 16.4 12 21 12 21Z" fill="#fff"/></svg>`;
const HAHA = `<span style="font-size:36px;font-weight:800;letter-spacing:-1px">HA</span>`;
const EXCL = `<span style="font-size:40px;font-weight:800">!!</span>`;
// A tapback pill on the top corner of a bubble: blue when it is mine (on their bubble), grey when theirs.
const tapback = (m) => `<div class="tap ${m.from === "me" ? "theirs" : "mine"}">${m.tapback === "heart" ? HEART : m.tapback === "haha" ? HAHA : EXCL}</div>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function html(slide) {
  const rows = slide.messages
    .map((m, i, all) => {
      if (m.ts) return `<div class="ts mid">${esc(m.ts)}</div>`;
      const next = all[i + 1];
      const last = !next || next.from !== m.from || Boolean(next.ts);
      const cls = `${m.from === "me" ? "out" : "in"}${last ? " last" : ""}`;
      if (m.typing) return `<div class="row l"><div class="bubble in last typing"><span></span><span></span><span></span></div></div>`;
      const status = m.status ? `<div class="status">${esc(m.status)}</div>` : "";
      if (m.image) {
        // A "blurred for privacy" photo: what people actually post when they screenshot receipts.
        return `<div class="row ${m.from === "me" ? "r" : "l"}"><div class="bubble ${cls} img"><div class="ph"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i></div>${m.tapback ? tapback(m) : ""}</div></div>`;
      }
      if (m.link) {
        // iMessage draws a rich link as a grey card whichever side sent it; only the alignment and tail change.
        const side = m.from === "me" ? `outlink${last ? " last" : ""}` : cls;
        return `<div class="row ${m.from === "me" ? "r" : "l"}"><div class="bubble ${side} link"><div class="lt"><div class="title">${esc(m.link.title)}</div><div class="domain">${esc(m.link.domain)}</div></div><div class="icon">${SEAL}</div></div></div>`;
      }
      return `<div class="row ${m.from === "me" ? "r" : "l"} ${status ? "has-status" : ""}"><div class="bubble ${cls}${m.tapback ? " tb" : ""}">${esc(m.text)}${m.tapback ? tapback(m) : ""}</div>${status}</div>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}
    body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Helvetica Neue",Helvetica,Arial,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
    .stage{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 40px}
    .ts{text-align:center;color:#8e8e93;font-size:30px;font-weight:600;margin-bottom:34px;letter-spacing:-.2px}
    .row{display:flex;width:100%;flex-wrap:wrap}
    .row.has-status{row-gap:8px}
    .status{flex-basis:100%;text-align:right;color:#8e8e93;font-size:28px;font-weight:600;padding-right:14px}
    .ts.mid{margin:34px 0 26px}
    .typing{display:flex;gap:10px;align-items:center;padding:30px 34px}
    .typing span{width:18px;height:18px;border-radius:50%;background:#8e8e93;display:block}
    .typing span:nth-child(2){opacity:.75}.typing span:nth-child(3){opacity:.5}
    .row.r{justify-content:flex-end}
    .row + .row{margin-top:6px}
    .row.l + .row.r, .row.r + .row.l{margin-top:26px}
    .bubble{position:relative;max-width:76%;padding:22px 36px;border-radius:46px;font-size:46px;line-height:1.22;letter-spacing:-.3px;word-wrap:break-word}
    .in{background:#262628;color:#fff}
    .out{background:#0a84ff;color:#fff}
    .in.last::before{content:"";position:absolute;bottom:0;left:-16px;width:44px;height:44px;background:#262628;border-bottom-right-radius:34px 30px}
    .in.last::after{content:"";position:absolute;bottom:0;left:-24px;width:24px;height:44px;background:#000;border-bottom-right-radius:22px}
    .out.last::before{content:"";position:absolute;bottom:0;right:-16px;width:44px;height:44px;background:#0a84ff;border-bottom-left-radius:34px 30px}
    .out.last::after{content:"";position:absolute;bottom:0;right:-24px;width:24px;height:44px;background:#000;border-bottom-left-radius:22px}
    .outlink{background:#262628;color:#fff}
    .outlink.last::before{content:"";position:absolute;bottom:0;right:-16px;width:44px;height:44px;background:#262628;border-bottom-left-radius:34px 30px}
    .outlink.last::after{content:"";position:absolute;bottom:0;right:-24px;width:24px;height:44px;background:#000;border-bottom-left-radius:22px}
    .img{padding:0;overflow:visible;background:transparent}
    .ph{width:520px;height:660px;border-radius:40px;overflow:hidden;position:relative;background:#3a3233}
    .ph i{position:absolute;border-radius:50%;filter:blur(38px);opacity:.9}
    .ph .a{width:360px;height:420px;left:40px;top:80px;background:#c9a58c}
    .ph .b{width:300px;height:380px;left:250px;top:150px;background:#8b6f63}
    .ph .c{width:520px;height:260px;left:0;top:460px;background:#2a2224}
    .ph .d{width:220px;height:200px;left:150px;top:-40px;background:#6b7a8f}
    .bubble.tb{margin-top:34px}
    .tap{position:absolute;top:-48px;height:74px;min-width:74px;padding:0 16px;border-radius:40px;display:grid;place-items:center;box-shadow:0 0 0 6px #000}
    .tap.mine{right:-22px;background:#0a84ff}
    .tap.theirs{left:-22px;background:#262628}
    .link{display:flex;align-items:center;gap:28px;padding:26px 30px 26px 40px;max-width:84%}
    .title{font-weight:700;font-size:44px;line-height:1.15}
    .domain{color:#8e8e93;font-size:36px;margin-top:8px}
    .icon{flex:none;width:132px;height:132px;border-radius:30px;background:#f6f1e8;display:grid;place-items:center}
  </style></head><body><div class="stage">${slide.timestamp ? `<div class="ts">${esc(slide.timestamp)}</div>` : ""}${rows}</div></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
let n = 0;
for (const slide of script.slides) {
  n += 1;
  if (slide.type !== "chat") continue;
  await page.setContent(html(slide));
  await page.waitForTimeout(150);
  const file = join(outDir, `slide-${String(n).padStart(2, "0")}.png`);
  await page.screenshot({ path: file });
  console.log("wrote", file);
}
await browser.close();
