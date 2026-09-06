import "server-only";

import Stripe from "stripe";
import { env, isConfigured } from "@/lib/env";
import { PRODUCTS, type ProductId } from "@/lib/pricing/products";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isConfigured.stripe) return null;
  if (!stripe) stripe = new Stripe(env.stripeSecretKey!, { typescript: true });
  return stripe;
}

export function priceIdFor(product: ProductId): string | undefined {
  const v = process.env[PRODUCTS[product].envPriceKey];
  return v && v.length > 0 ? v : undefined;
}

export const stripeReady = () => isConfigured.stripe && (["single", "pick3", "everything"] as ProductId[]).every((p) => Boolean(priceIdFor(p)));
