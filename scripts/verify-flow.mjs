/**
 * Full product flow against the real Supabase project, no email required:
 * create a throwaway user → sign in via admin-generated magic link → build a gift in the editor →
 * publish → open it as a recipient → send a reaction → check the dashboard. Cleans up after itself.
 *
 *   node scripts/verify-flow.mjs [outDir] [baseURL]
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (reads .env.local).
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = `e2e-${Date.now()}@ethoslove.test`;
const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: "E2E Tester", locale: "en" } });
if (createErr) throw createErr;
const userId = created.user.id;
console.log("user:", userId);
// The gift below carries a video clip and a voice message, both premium extras, so the
// throwaway user gets an "Everything" unlock (what a buyer would have). Cleaned up with the user.
{
  const { error: unlockErr } = await admin.from("template_unlocks").insert({ user_id: userId, template_slug: "*" });
  if (unlockErr) throw unlockErr;
}

const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: "en-US", permissions: ["microphone"] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 300)}`));
const shot = (n) => page.screenshot({ path: join(out, `flow-${n}.png`) });

try {
  // 1. Sign in with a server-generated magic link (token_hash flow → /auth/confirm)
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkErr) throw linkErr;
  const tokenHash = link.properties.hashed_token;
  await page.goto(`${base}/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=/dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "My gifts" }).waitFor({ timeout: 20000 });
  console.log("signed in → dashboard");
  await shot("01-dashboard-empty");

  // profile row created by trigger?
  const { data: profile } = await admin.from("profiles").select("email, name, locale").eq("id", userId).single();
  console.log("profile:", profile);

  // 2. Build a gift
  await page.goto(`${base}/create/the-letter`, { waitUntil: "networkidle" });
  await page.getByLabel("Their name").waitFor({ timeout: 20000 });
  await page.getByLabel("Their name").fill("Ana");
  await page.getByLabel("Your name").fill("Marco");
  await page.getByLabel("Message").fill("Three years ago you asked if the seat next to me was taken. **It wasn't.**\n\nIt still isn't.");
  await page.locator('input[type="file"]').first().setInputFiles(["public/demo/photos/p1.webp", "public/demo/photos/p2.webp"]);
  await page.getByText("Uploaded").first().waitFor({ timeout: 40000 });
  // video clip (reuse a captured preview so no encoder is needed)
  await page.locator('input[type="file"][accept*="video"]').setInputFiles("public/templates/constellations/preview.webm");
  // voice message (fake microphone)
  const rec = page.getByTestId("voice-record");
  await rec.scrollIntoViewIfNeeded();
  await rec.click();
  await page.waitForTimeout(2200);
  await rec.click();
  await page.getByText(/Voice message · \d+s/).waitFor({ timeout: 10000 });
  await page.getByText(/^Uploaded · /).waitFor({ timeout: 60000 });
  await page.waitForTimeout(2500); // debounced remote save
  await shot("02-editor");
  const { data: drafts } = await admin.from("gifts").select("id, short_id, status, data").eq("user_id", userId);
  console.log("draft rows:", drafts?.map((d) => ({ id: d.id, status: d.status, photos: d.data?.photos?.length, firstUrl: d.data?.photos?.[0]?.url, video: d.data?.video })));
  const { data: files } = await admin.storage.from("gifts").list(drafts[0].id);
  console.log("storage objects:", files?.map((f) => f.name));

  // 3. Publish
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByText("Ready to send?").waitFor({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await shot("03-publish-sheet");
  await page.getByRole("button", { name: /publish now/i }).click();
  await page.getByText("It's live.").waitFor({ timeout: 30000 });
  await shot("04-share");
  const { data: live } = await admin.from("gifts").select("short_id, status, watermark, published_at").eq("user_id", userId).single();
  console.log("published:", live);
  const giftUrl = `${base}/g/${live.short_id}`;

  // 4. Open as a recipient (fresh, signed-out context)
  const recipient = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US", isMobile: true, hasTouch: true });
  const rp = await recipient.newPage();
  rp.on("pageerror", (e) => errors.push(`recipient pageerror: ${e.message}`));
  await rp.goto(giftUrl, { waitUntil: "networkidle" });
  await rp.getByRole("button", { name: /tap to open/i }).waitFor({ timeout: 20000 });
  await rp.screenshot({ path: join(out, "flow-05-recipient-gate.png") });
  await rp.getByRole("button", { name: /tap to open/i }).click();
  const loading = rp.getByText(/someone made this for you, ana/i);
  await loading.waitFor({ state: "hidden", timeout: 30000 });
  await rp.getByRole("button", { name: /tap the seal/i }).click({ force: true });
  await rp.getByText("Marco", { exact: true }).waitFor({ timeout: 60000 });
  await rp.screenshot({ path: join(out, "flow-06-recipient-letter.png") });
  const clip = await rp.locator("video").count();
  console.log("recipient sees video element:", clip > 0);
  const voice = await rp.getByText(/A voice message/).count();
  console.log("recipient sees voice note:", voice > 0);
  const scroller = rp.locator('[class*="scroller"]').first();
  await scroller.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }));
  await rp.waitForTimeout(1500);
  await rp.getByRole("button", { name: /send marco a reaction/i }).click();
  await rp.getByText(/send marco a reaction/i).first().waitFor();
  await rp.locator("textarea").fill("I'm crying at work. Three years.");
  await rp.getByRole("button", { name: "Send ❤️", exact: true }).click();
  await rp.getByText(/sent to marco/i).waitFor({ timeout: 15000 });
  await rp.screenshot({ path: join(out, "flow-07-reaction-sent.png") });
  await recipient.close();
  const { data: views } = await admin.from("gift_views").select("watch_pct, device").eq("gift_id", drafts[0].id);
  const { data: reactions } = await admin.from("reactions").select("emoji, text").eq("gift_id", drafts[0].id);
  console.log("views:", views, "reactions:", reactions);

  // 5. Dashboard shows it
  await page.goto(`${base}/dashboard`, { waitUntil: "networkidle" });
  await page.getByText("Ana").first().waitFor({ timeout: 20000 });
  await shot("08-dashboard");
  await page.goto(`${base}/dashboard/gift/${drafts[0].id}`, { waitUntil: "networkidle" });
  await page.getByText("I'm crying at work").waitFor({ timeout: 20000 });
  await shot("09-gift-detail");
  console.log("FLOW OK");
} catch (e) {
  console.log("FLOW FAILED:", e.message);
  await shot("99-failure").catch(() => {});
} finally {
  await browser.close();
  // Cleanup: storage objects then the user (rows cascade)
  const { data: gifts } = await admin.from("gifts").select("id").eq("user_id", userId);
  for (const g of gifts ?? []) {
    for (const bucket of ["gifts", "reactions"]) {
      const { data: files } = await admin.storage.from(bucket).list(g.id);
      if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${g.id}/${f.name}`));
    }
  }
  await admin.auth.admin.deleteUser(userId);
  console.log("cleaned up");
  console.log(errors.length ? `PAGE ERRORS:\n${errors.join("\n")}` : "no page errors");
}
