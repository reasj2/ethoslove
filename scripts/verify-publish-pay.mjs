/**
 * The buy path from the editor: throwaway user → premium template → Publish → the sheet offers
 * "Pay … and send" → Stripe Checkout URL is created (not paid). Cleans up the user.
 *   node scripts/verify-publish-pay.mjs [outDir] [baseURL]
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
const email = `pay-${Date.now()}@ethoslove.test`;
const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: "Pay Tester", locale: "en" } });
if (createErr) throw createErr;
const userId = created.user.id;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const shot = (n) => page.screenshot({ path: join(out, `pay-${n}.png`) });
try {
  const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  await page.goto(`${base}/auth/confirm?token_hash=${link.properties.hashed_token}&type=magiclink&next=/create/passport`, { waitUntil: "networkidle" });
  await page.getByLabel("Their name", { exact: true }).fill("Ana");
  await page.getByLabel("Your name", { exact: true }).fill("Marco");
  await page.getByLabel("Message").fill("Two thousand kilometres and one tap.");
  await page.locator('input[type="file"]').first().setInputFiles("public/demo/photos/p1.webp");
  await page.getByText(/^Uploaded/).first().waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByTestId("pay-panel").waitFor({ timeout: 15000 });
  await shot("01-sheet");
  const label = await page.getByTestId("pay-single").textContent();
  console.log("pay button:", label?.trim());
  await page.getByTestId("pay-single").click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
  const onStripe = page.url().startsWith("https://checkout.stripe.com");
  console.log("landed on Stripe:", onStripe);
  console.log(onStripe ? "PUBLISH-PAY OK" : "PUBLISH-PAY FAILED");
} finally {
  await browser.close();
  await admin.from("purchases").delete().eq("user_id", userId);
  await admin.auth.admin.deleteUser(userId);
}
