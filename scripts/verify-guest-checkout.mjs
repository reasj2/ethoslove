/**
 * Guest checkout, end to end: no account → build a premium gift → Publish → "Pay … and send"
 * → Stripe hosted Checkout with the test card and a fresh email → account created, browser
 * signed in, gift published on return. Cleans up the user (gifts/purchases cascade).
 *   node scripts/verify-guest-checkout.mjs [outDir] [baseURL]
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
const email = `guest-${Date.now()}@ethoslove.test`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const shot = (n) => page.screenshot({ path: join(out, `guest-${n}.png`) });
let userId = null;
try {
  await page.goto(`${base}/create/passport`, { waitUntil: "networkidle" });
  await page.getByLabel("Their name", { exact: true }).fill("Ana");
  await page.getByLabel("Your name", { exact: true }).fill("Marco");
  await page.getByLabel("Message").fill("Two thousand kilometres and one tap.");
  await page.locator('input[type="file"]').first().setInputFiles("public/demo/photos/p1.webp");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByTestId("pay-panel").waitFor({ timeout: 15000 });
  await shot("01-sheet-guest");
  console.log("guest pay button:", (await page.getByTestId("pay-single").textContent())?.trim());
  await page.getByTestId("pay-single").click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
  await page.locator("#email").waitFor({ timeout: 30000 });
  await page.locator("#email").fill(email);
  await page.locator("#cardNumber").fill("4242 4242 4242 4242");
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Guest Tester");
  const country = page.locator("#billingCountry");
  if (await country.count()) await country.selectOption("ES").catch(() => {});
  const postal = page.locator("#billingPostalCode");
  if (await postal.count()) await postal.fill("28001").catch(() => {});
  await shot("02-stripe");
  await page.locator("button[type=submit], .SubmitButton").first().click();
  await page.waitForURL((u) => u.pathname.includes("/create/passport"), { timeout: 90000 });
  console.log("back in the editor:", page.url().replace(base, ""));
  await page.getByText("It's live.").waitFor({ timeout: 90000 });
  await shot("03-live");
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  userId = profile?.id ?? null;
  const { data: purchases } = userId ? await admin.from("purchases").select("status, product").eq("user_id", userId) : { data: [] };
  const { data: unlocks } = userId ? await admin.from("template_unlocks").select("template_slug").eq("user_id", userId) : { data: [] };
  const { data: gifts } = userId ? await admin.from("gifts").select("status, template_slug").eq("user_id", userId) : { data: [] };
  console.log("account created:", Boolean(userId), "| purchases:", purchases, "| unlocks:", unlocks?.map((u) => u.template_slug), "| gifts:", gifts);
  const ok = Boolean(userId) && purchases?.some((p) => p.status === "paid") && gifts?.some((g) => g.status === "live");
  console.log(ok ? "GUEST CHECKOUT OK" : "GUEST CHECKOUT FAILED");
} finally {
  await browser.close();
  if (!userId) {
    const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
    userId = profile?.id ?? null;
  }
  if (userId) {
    await admin.from("template_unlocks").delete().eq("user_id", userId);
    await admin.from("purchases").delete().eq("user_id", userId);
    await admin.auth.admin.deleteUser(userId);
  }
}
