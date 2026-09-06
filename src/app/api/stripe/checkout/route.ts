import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { SITE } from "@/config/site";
import { PRODUCTS, currencyFor, isProductId, type Currency } from "@/lib/pricing/products";
import { getStripe, priceIdFor } from "@/lib/stripe/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { TEMPLATE_SLUGS } from "@/templates/registry";

const input = z.object({
  product: z.string(),
  templateSlugs: z.array(z.string()).default([]),
  returnTo: z.string().startsWith("/").optional(),
  currency: z.enum(["usd", "eur", "gbp"]).optional(),
});

/** Creates a pending purchase + Stripe Checkout Session and returns its URL. */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "payments_not_configured" }, { status: 503 });
  const supabase = await getSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isProductId(parsed.data.product)) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { product, returnTo } = parsed.data;
  const price = priceIdFor(product);
  if (!price) return NextResponse.json({ error: "price_not_configured" }, { status: 503 });

  const slugs = Array.from(new Set(parsed.data.templateSlugs.filter((s) => TEMPLATE_SLUGS.includes(s))));
  const needed = PRODUCTS[product].picks;
  if (Number.isFinite(needed) && slugs.length !== needed) return NextResponse.json({ error: "wrong_template_count", needed }, { status: 400 });

  const wanted: Currency = parsed.data.currency ?? currencyFor(request.headers.get("x-vercel-ip-country") ?? request.headers.get("accept-language")?.split(",")[0]);
  // Only charge in a currency the Price actually carries; otherwise fall back to its default.
  const priceObject = await stripe.prices.retrieve(price, { expand: ["currency_options"] });
  const supported = new Set<string>([priceObject.currency, ...Object.keys(priceObject.currency_options ?? {})]);
  const currency: Currency = supported.has(wanted) ? wanted : (priceObject.currency as Currency);
  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({ user_id: user.id, product, template_slugs: product === "everything" ? [] : slugs, amount: PRODUCTS[product].amounts[currency], currency, status: "pending" })
    .select("id")
    .single();
  if (error || !purchase) return NextResponse.json({ error: "purchase_failed" }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const back = returnTo ?? "/dashboard";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    currency,
    customer_email: user.email ?? undefined,
    client_reference_id: purchase.id,
    metadata: { purchase_id: purchase.id, user_id: user.id, product, template_slugs: slugs.join(",") },
    allow_promotion_codes: true,
    // Shared Stripe account: make the charge recognisable on statements.
    payment_intent_data: { statement_descriptor_suffix: "ETHOS" },
    automatic_tax: process.env.STRIPE_AUTOMATIC_TAX === "true" ? { enabled: true } : undefined,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&return=${encodeURIComponent(back)}`,
    cancel_url: `${origin}${back}`,
  });
  await supabase.from("purchases").update({ stripe_session_id: session.id }).eq("id", purchase.id);
  return NextResponse.json({ url: session.url });
}
