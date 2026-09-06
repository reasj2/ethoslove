/** Sanity-checks the Stripe keys and products in .env.local:  node scripts/check-stripe.mjs */
import Stripe from "stripe";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const acct = await stripe.accounts.retrieve();
console.log("account:", acct.settings?.dashboard?.display_name, "| currency:", acct.default_currency, "| livemode:", acct.charges_enabled);
for (const key of ["STRIPE_PRODUCT_SINGLE", "STRIPE_PRODUCT_PICK3", "STRIPE_PRODUCT_EVERYTHING"]) {
  const p = await stripe.products.retrieve(env[key], { expand: ["default_price"] });
  const dp = p.default_price;
  const prices = await stripe.prices.list({ product: p.id, active: true, limit: 5 });
  console.log(key, "→", p.name, "| default_price:", dp ? `${dp.id} ${dp.unit_amount / 100} ${dp.currency} ${dp.type}` : "NONE", "| active prices:", prices.data.map((x) => `${x.unit_amount / 100} ${x.currency} ${x.type}`).join(", "));
}
