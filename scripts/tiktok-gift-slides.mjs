/**
 * Publishes the carousel's demo gift and captures the gift slides at 1080×1920:
 *   node scripts/tiktok-gift-slides.mjs docs/marketing/tiktok-01
 * Re-runs reuse the same short id, so the link in the video keeps working.
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2] ?? ".";
const base = process.argv[3] ?? "http://localhost:3000";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 9 characters, none of them from the pairs the alphabet drops (i/l/o/0/1).
const SHORT_ID = "jayandmya";
const REASONS = [
  "ur the only girl ive ever looked at. ever.",
  "i would literally die without u",
  "nobody else even comes close. nobody.",
  "ur my best friend and my girl and my whole world",
  "i love how jealous u get. it means u care.",
  "i think about u every second of every day",
  "ur laugh when u came down the stairs at the lake house. i think about it every day.",
  "i want to marry u one day. not even joking.",
  "u forgive me when i dont deserve it. thats how i know its real.",
  "nobody will ever love u like i love u. nobody.",
  "id delete every girl off my phone for u. say the word.",
  "ur it for me. forever. even when i mess up.",
];
const MESSAGE = [
  "Mia. I don't know how to say this properly so I'm just going to say it.",
  "",
  "You are the best thing that has ever happened to me. I have never felt like this about anyone in my life and I never will again. When you're not here I can't function, I can't eat, I can't think straight. You're my whole world.",
  "",
  "I know I mess up. I know I get defensive. That's only because I'm terrified of losing you, and everyone I've ever cared about has left. I'm not going to be that person any more. You have my word, S.",
  "",
  "Nobody will ever love you the way I love you. Nobody. I'd burn my whole life down for you and I'd do it twice.",
  "",
  "I'm outside. Please open the door.",
].join("\n");

const photo = (id, url, w, h, caption) => ({ id, url, width: w, height: h, alt: caption, caption });
const data = {
  version: 1,
  templateSlug: "jar-of-reasons",
  locale: "en",
  recipientName: "Mia",
  senderName: "Jay",
  title: "For Mia",
  message: MESSAGE,
  messageStyle: "typewriter",
  photos: [
    photo("g1", "/demo/photos/p1.webp", 896, 1200, "my girl"),
    photo("g2", "/demo/photos/p2.webp", 896, 1200, "us"),
    photo("g3", "/demo/photos/p7.webp", 1200, 896, "forever"),
    photo("g4", "/demo/photos/p5.webp", 1200, 896, "mine"),
  ],
  music: { source: "library", trackId: "slow-dance", url: "/audio/library/slow-dance.mp3", title: "Slow Dance", startAt: 0 },
  surprise: { text: "im outside. open the door.", reveal: "hold" },
  accentColor: "#C2352B",
  fontPairing: "handwritten",
  showReactionCta: true,
  watermark: true,
  fields: { reasons: REASONS, label: "12 reasons ur my whole world", paper: "pastel" },
};

const { data: profile } = await admin.from("profiles").select("id").limit(1).single();
const { data: gift, error } = await admin
  .from("gifts")
  .upsert(
    { short_id: SHORT_ID, user_id: profile.id, template_slug: "jar-of-reasons", locale: "en", data, status: "live", watermark: true, published_at: new Date().toISOString() },
    { onConflict: "short_id" },
  )
  .select("short_id")
  .single();
if (error) throw new Error(error.message);
console.log(`gift live at ${base}/g/${gift.short_id}`);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
// 540×960 at 2x is exactly 1080×1920, the size TikTok wants for a photo carousel.
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const shot = (n, name) => page.screenshot({ path: join(outDir, `gift-0${n}-${name}.png`) });

await page.goto(`${base}/g/${gift.short_id}`, { waitUntil: "networkidle", timeout: 120000 });
// The motion prompt is a one-tap thing on a real phone; it should not be in a slide.
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
// A published gift waits for a tap before it plays anything, so the music can start.
await page.getByText(/tap to open/i).click({ force: true, timeout: 40000 });
await page.getByText(/someone made this for you/i).waitFor({ state: "hidden", timeout: 40000 });
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /enable motion/i }).evaluate((el) => el.remove()).catch(() => {});
await shot(1, "jar");

const jar = page.getByRole("button", { name: /tap the jar/i }).first();
const noteText = () => page.locator("text=Tap to fold it back").locator("xpath=..").innerText();
const fold = () => page.locator("text=Tap to fold it back").click({ force: true }).catch(() => {});

// Note 1 always carries the first photo.
await jar.click({ force: true });
await page.waitForTimeout(2200);
await shot(2, "note-photo");

// Empty the jar, stopping to shoot the "delete every girl" note — that is slide G3.
let gotDelete = false;
for (let i = 0; i < 12; i++) {
  await fold();
  await page.waitForTimeout(600);
  await jar.click({ force: true });
  await page.waitForTimeout(1700);
  if ((await page.locator("text=Tap to fold it back").count()) === 0) break; // jar empty
  if (!gotDelete && (await noteText()).includes("delete every girl")) {
    await shot(3, "note-delete");
    gotDelete = true;
  }
}
await fold();
await page.waitForTimeout(900);

// The letter, caught mid-typing.
await page.getByRole("button", { name: /read the letter/i }).click({ force: true });
await page.waitForTimeout(11500);
await shot(4, "letter");

// The surprise: hold the gift button until the ring fills, then frame the ending.
await page.waitForTimeout(16000);
const gate = page.getByRole("button", { name: /hold/i }).last();
if (await gate.count()) {
  await gate.scrollIntoViewIfNeeded();
  const box = await gate.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2600);
  await page.mouse.up();
  await page.waitForTimeout(1400);
}
// Put the P.S. and "the end" in the middle of the frame, clear of the watermark.
await page.locator("text=/^P\\.S\\.$/i").first().scrollIntoViewIfNeeded().catch(() => {});
await page.evaluate(() => {
  const sc = document.querySelector("[class*=overflow-y-auto]");
  sc?.scrollBy({ top: -120, behavior: "instant" });
});
await page.waitForTimeout(900);
await shot(5, "surprise");

// The ending, for the last slide: who it is from, and the reaction button.
await page.evaluate(() => {
  const sc = document.querySelector("[class*=overflow-y-auto]");
  sc?.scrollTo({ top: sc.scrollHeight, behavior: "instant" });
});
await page.waitForTimeout(900);
await shot(6, "end");

await browser.close();
console.log("wrote gift-01…gift-05");
