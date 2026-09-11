/**
 * Renders iMessage chat slides (1080×1920, dark mode) for TikTok photo carousels from a script
 * JSON, drawn to iOS 18 Messages at @3x: 17pt text, 18pt corners, colour Tapbacks and rich link
 * previews. Uses the Mac's system font through Chromium, so the type is the real thing.
 *   node scripts/tiktok-slides.mjs docs/marketing/tiktok-01/script.json docs/marketing/tiktok-01
 *
 * Message shapes: { from: "me"|"them", text } · { image: true } · { typing: true } · { ts } ·
 * { link: { title, domain, image?: "og", name?, lang? } } · plus optional { status } and { tapback }.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [scriptPath, outDir] = [process.argv[2], process.argv[3] ?? "."];
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
mkdirSync(outDir, { recursive: true });

// iOS 18 draws Tapbacks in colour whichever side sent them; the heart is red.
const ICONS = {
  heart: `<svg viewBox="0 0 24 24" width="46" height="46"><path d="M12 21.3s-7.9-4.8-10.1-9.6C.4 8.3 2.3 4.2 6.3 4.2c2.1 0 3.7 1.2 5.7 3.4 2-2.2 3.6-3.4 5.7-3.4 4 0 5.9 4.1 4.4 7.5C19.9 16.5 12 21.3 12 21.3Z" fill="#FF3B55"/></svg>`,
  haha: `<span class="haha">HA<br>HA</span>`,
  excl: `<span class="excl">!!</span>`,
  like: `<span class="emoji">👍</span>`,
};
// Tapbacks sit on the top corner that faces the middle of the screen, with a thought-bubble tail.
const tapback = (m) => {
  const mine = m.from !== "me"; // I react to their message, they react to mine
  const side = m.from === "me" ? "left" : "right";
  return `<div class="tap ${mine ? "mine" : "theirs"} ${side}"><i></i>${ICONS[m.tapback] ?? ICONS.excl}</div>`;
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
// "Today 19:42" → the day in semibold, the time in regular, as iOS sets it.
const stamp = (s) => {
  const [head, ...rest] = String(s).split(" ");
  return rest.length ? `<b>${esc(head)}</b> ${esc(rest.join(" "))}` : `<b>${esc(head)}</b>`;
};

/** The preview image iMessage pulls from a gift link: tryethos.io's og:image, drawn to match. */
const ogImage = (name, lang) => {
  const es = lang === "es";
  return `
  <div class="og">
    <div class="og-seal"><span></span></div>
    <div class="og-line">${esc(name ?? "Hey")}, ${es ? "alguien te ha hecho algo" : "someone made you something"} 💌</div>
    <div class="og-sub">${es ? "Ábrelo con el sonido activado" : "Open it with your sound on"}</div>
  </div>`;
};

function html(slide) {
  const rows = slide.messages
    .map((m, i, all) => {
      if (m.ts) return `<div class="ts mid">${stamp(m.ts)}</div>`;
      const next = all[i + 1];
      const last = !next || next.from !== m.from || Boolean(next.ts) || Boolean(next.typing);
      const cls = `${m.from === "me" ? "out" : "in"}${last ? " last" : ""}`;
      const row = m.from === "me" ? "r" : "l";
      const status = m.status ? `<div class="status">${stamp(m.status)}</div>` : "";
      if (m.typing) {
        return `<div class="row l"><div class="bubble in typing"><span></span><span></span><span></span><i class="t1"></i><i class="t2"></i></div></div>`;
      }
      if (m.image) {
        return `<div class="row ${row}"><div class="media">${m.tapback ? tapback(m) : ""}<div class="ph"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i></div></div></div>`;
      }
      if (m.link) {
        // A rich link is a grey card on either side; only its alignment and tail change.
        const tail = last ? ` last ${m.from === "me" ? "tail-r" : "tail-l"}` : "";
        const img = m.link.image === "og" ? `<div class="lk-img">${ogImage(m.link.name, m.link.lang)}</div>` : "";
        return `<div class="row ${row} ${status ? "has-status" : ""}"><div class="bubble link${tail}${img ? " big" : ""}">${img}<div class="lk-foot"><div class="lk-text"><div class="lk-title">${esc(m.link.title)}</div><div class="lk-domain">${esc(m.link.domain)}</div></div>${img ? "" : `<div class="lk-thumb">${ogImage(m.link.name, m.link.lang)}</div>`}</div>${m.tapback ? tapback(m) : ""}</div>${status}</div>`;
      }
      return `<div class="row ${row} ${status ? "has-status" : ""}${m.tapback ? " has-tap" : ""}"><div class="bubble ${cls}">${esc(m.text)}${m.tapback ? tapback(m) : ""}</div>${status}</div>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}
    body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;color:#fff;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    .stage{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 48px 0 42px}
    .ts{text-align:center;color:#8e8e93;font-size:35px;margin:0 0 30px;letter-spacing:-.2px}
    .ts b{font-weight:600}
    .ts.mid{margin:36px 0 26px}
    .row{display:flex;width:100%;flex-wrap:wrap}
    .row.r{justify-content:flex-end}
    .row + .row{margin-top:6px}
    .row.l + .row.r, .row.r + .row.l{margin-top:28px}
    /* iOS opens up space above a message that carries a Tapback, so the reaction never sits on the bubble above. */
    .row.has-tap{margin-top:72px}
    .status{flex-basis:100%;text-align:right;color:#8e8e93;font-size:33px;margin-top:8px;padding-right:12px;letter-spacing:-.1px}
    .status b{font-weight:600}

    .bubble{position:relative;max-width:73%;padding:20px 38px 21px;border-radius:54px;font-size:51px;line-height:66px;letter-spacing:-.9px;word-wrap:break-word;box-sizing:border-box}
    .in{background:#262629}
    .out{background:#0B84FF}
    /* The tail: a curved spur on the last bubble of a run, cut out of the black behind it. */
    .in.last::before,.out.last::before,.link.last::before{content:"";position:absolute;bottom:0;width:48px;height:46px}
    .in.last::after,.out.last::after,.link.last::after{content:"";position:absolute;bottom:0;width:26px;height:46px;background:#000}
    .in.last::before{left:-17px;background:#262629;border-bottom-right-radius:38px 32px}
    .in.last::after{left:-26px;border-bottom-right-radius:24px}
    .out.last::before{right:-17px;background:#0B84FF;border-bottom-left-radius:38px 32px}
    .out.last::after{right:-26px;border-bottom-left-radius:24px}
    .link.tail-l::before{left:-17px;background:#262629;border-bottom-right-radius:38px 32px}
    .link.tail-l::after{left:-26px;border-bottom-right-radius:24px}
    .link.tail-r::before{right:-17px;background:#262629;border-bottom-left-radius:38px 32px}
    .link.tail-r::after{right:-26px;border-bottom-left-radius:24px}

    .typing{display:flex;gap:11px;align-items:center;padding:34px 36px;border-radius:54px;overflow:visible}
    .typing span{width:19px;height:19px;border-radius:50%;background:#8e8e93;display:block}
    .typing span:nth-child(2){opacity:.7}.typing span:nth-child(3){opacity:.45}
    .typing .t1,.typing .t2{position:absolute;border-radius:50%;background:#262629}
    .typing .t1{width:26px;height:26px;left:-6px;bottom:-4px}
    .typing .t2{width:12px;height:12px;left:-20px;bottom:-16px}

    .tap{position:absolute;top:-74px;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 0 6px #000;z-index:2}
    .tap.mine{background:#0B84FF}
    .tap.theirs{background:#3A3A3C}
    .tap.right{right:-46px}
    .tap.left{left:-46px}
    .tap i{position:absolute;width:16px;height:16px;border-radius:50%;background:inherit;box-shadow:0 0 0 4px #000;bottom:-6px}
    .tap.right i{left:3px}
    .tap.left i{right:3px}
    .haha{font-size:26px;font-weight:800;line-height:24px;text-align:center;color:#fff;letter-spacing:-.5px}
    .excl{font-size:46px;font-weight:800;color:#FF3B55;letter-spacing:-3px}
    .emoji{font-size:44px}

    .media{position:relative}
    .ph{width:560px;height:720px;border-radius:54px;overflow:hidden;position:relative;background:#3a3233}
    .ph i{position:absolute;border-radius:50%;filter:blur(40px);opacity:.9}
    .ph .a{width:380px;height:440px;left:40px;top:90px;background:#c9a58c}
    .ph .b{width:320px;height:400px;left:270px;top:160px;background:#8b6f63}
    .ph .c{width:560px;height:280px;left:0;top:500px;background:#2a2224}
    .ph .d{width:240px;height:220px;left:160px;top:-40px;background:#6b7a8f}

    .link{background:#262629;padding:0;overflow:visible;width:auto;max-width:78%}
    .link.big{width:788px}
    .lk-img{height:412px;border-radius:54px 54px 0 0;overflow:hidden}
    .lk-foot{display:flex;align-items:center;gap:26px;padding:26px 36px 28px}
    .link:not(.big) .lk-foot{padding:26px 26px 26px 38px}
    .lk-text{min-width:0;flex:1}
    .lk-title{font-weight:600;font-size:44px;line-height:54px;letter-spacing:-.6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .lk-domain{color:#8e8e93;font-size:37px;margin-top:4px;letter-spacing:-.3px}
    .lk-thumb{flex:none;width:136px;height:136px;border-radius:24px;overflow:hidden}
    .lk-thumb .og-line,.lk-thumb .og-sub{display:none}
    .lk-thumb .og-seal{width:64px;height:64px;margin:0}
    .lk-thumb .og-seal span{width:22px;height:22px}

    .og{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(80% 60% at 50% 0%,#3a2a26 0%,#141110 60%);color:#FAF7F2;text-align:center;padding:0 22px;box-sizing:border-box}
    .og-seal{width:80px;height:80px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 36% 30%,#F4C7C3,#E8604C 48%,#B23A2E 100%);box-shadow:0 14px 40px rgba(232,96,76,.35)}
    .og-seal span{width:27px;height:27px;border-radius:50%;background:#FFF8F4;opacity:.95}
    .og-line{margin-top:30px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:39px;line-height:1.1;letter-spacing:-.5px;white-space:nowrap}
    .og-sub{margin-top:14px;font-size:20px;color:rgba(250,247,242,.6)}
  </style></head><body><div class="stage">${slide.timestamp ? `<div class="ts">${stamp(slide.timestamp)}</div>` : ""}${rows}</div></body></html>`;
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
