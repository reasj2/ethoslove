/**
 * Real test-mode purchase: throwaway user → /api/stripe/checkout → Stripe hosted Checkout
 * with card 4242 → /checkout/success → template_unlocks row. Cleans up the user afterwards.
 *   node scripts/verify-checkout.mjs [outDir] [baseURL] [product]
 */
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "./.verify";
const base = process.argv[3] ?? "http://localhost:3000";
const product = process.argv[4] ?? "everything";
mkdirSync(out, { recursive: true });
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = `checkout-${Date.now()}@ethoslove.test`;
const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: "Checkout Tester", locale: "en" } });
if (createErr) throw createErr;
const userId = created.user.id;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-US" });
const page = await context.newPage();
const shot = (n) => page.screenshot({ path: join(out, `checkout-${n}.png`) });

try {
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkErr) throw linkErr;
  await page.goto(`${base}/auth/confirm?token_hash=${link.properties.hashed_token}&type=magiclink&next=/pricing`, { waitUntil: "networkidle" });
  await shot("01-pricing");

  const res = await page.request.post(`${base}/api/stripe/checkout`, { data: { product, templateSlugs: product === "single" ? ["passport"] : product === "pick3" ? ["passport", "bloom", "arcade"] : [], returnTo: "/dashboard" } });
  const body = await res.json();
  console.log("checkout api:", res.status(), body.url ? body.url.slice(0, 60) + "…" : body);
  if (!body.url) throw new Error("no checkout url");

  await page.goto(body.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot("02-stripe");
  // Stripe's hosted page: card details live in same-origin fields on checkout.stripe.com
  const card = page.locator("#cardNumber");
  await card.waitFor({ timeout: 30000 });
  await card.fill("4242 4242 4242 4242");
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Checkout Tester");
  const country = page.locator("#billingCountry");
  if (await country.count()) await country.selectOption("ES").catch(() => {});
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill("28001").catch(() => {});
  await shot("03-filled");
  await page.locator("button[type=submit], .SubmitButton").first().click();
  await page.waitForURL(/checkout\/success/, { timeout: 60000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await shot("04-success");
  console.log("landed on:", page.url().slice(0, 80));

  const { data: unlocks } = await admin.from("template_unlocks").select("template_slug").eq("user_id", userId);
  const { data: purchases } = await admin.from("purchases").select("status, amount, currency, product").eq("user_id", userId);
  console.log("purchases:", purchases);
  console.log("unlocks:", unlocks?.map((u) => u.template_slug));
  const ok = purchases?.some((p) => p.status === "paid") && (unlocks?.length ?? 0) > 0;
  console.log(ok ? "CHECKOUT OK" : "CHECKOUT FAILED");
} finally {
  await browser.close();
  await admin.from("template_unlocks").delete().eq("user_id", userId);
  await admin.from("purchases").delete().eq("user_id", userId);
  await admin.auth.admin.deleteUser(userId);
}
