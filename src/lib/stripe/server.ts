import "server-only";

import Stripe from "stripe";
import { env, isConfigured } from "@/lib/env";
import { PRODUCTS, type ProductId } from "@/lib/pricing/products";

let stripe: Stripe | null = null;
const priceCache = new Map<string, string>();

export function getStripe(): Stripe | null {
  if (!isConfigured.stripe) return null;
  if (!stripe) stripe = new Stripe(env.stripeSecretKey!, { typescript: true });
  return stripe;
}

function envValue(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

/** Explicit Price ID from env, if set. */
export function priceIdFor(product: ProductId): string | undefined {
  return envValue(PRODUCTS[product].envPriceKey);
}

/** Product ID from env, if set (its default price is charged). */
export function productIdFor(product: ProductId): string | undefined {
  return envValue(PRODUCTS[product].envProductKey);
}

/**
 * The Price to charge. Prefers STRIPE_PRICE_*; otherwise looks up the default price of
 * STRIPE_PRODUCT_* once and caches it for the life of the process.
 */
export async function resolvePriceId(client: Stripe, product: ProductId): Promise<string | undefined> {
  const explicit = priceIdFor(product);
  if (explicit) return explicit;
  const productId = productIdFor(product);
  if (!productId) return undefined;
  const cached = priceCache.get(productId);
  if (cached) return cached;
  const p = await client.products.retrieve(productId);
  const dp = p.default_price;
  const id = typeof dp === "string" ? dp : dp?.id;
  if (!id) {
    // No default price yet: pick the first active one-off price on the product.
    const list = await client.prices.list({ product: productId, active: true, type: "one_time", limit: 1 });
    const first = list.data[0]?.id;
    if (!first) return undefined;
    priceCache.set(productId, first);
    return first;
  }
  priceCache.set(productId, id);
  return id;
}

export const stripeReady = () => isConfigured.stripe && (["single", "pick3", "everything"] as ProductId[]).every((p) => Boolean(priceIdFor(p) || productIdFor(p)));
