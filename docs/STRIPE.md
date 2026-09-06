# Stripe setup

Everything below is what the code in `src/lib/pricing`, `src/app/api/stripe/*` and
`src/app/actions/checkout.ts` expects. Do it once in **test mode**, then repeat in **live mode**.

## 1. Products and prices (Dashboard → Product catalog)

Create **three products**, each with **one one-time Price** that has multi-currency amounts
(open the price → "Add another currency"). Prices are tax-inclusive where you sell to consumers
in the EU; enable Stripe Tax if you want it calculated automatically.

| Product name (Stripe) | Description shown at checkout                                   | USD    | EUR    | GBP    |
| --------------------- | --------------------------------------------------------------- | ------ | ------ | ------ |
| Ethos — Single Template | One premium template, unlocked forever. No subscription.       | 7.99   | 7.49   | 6.49   |
| Ethos — Pick 3        | Any three templates, unlocked forever. No subscription.         | 11.99  | 10.99  | 9.49   |
| Ethos — Everything    | Every template, current and future, forever. Priority support.  | 24.99  | 22.99  | 19.99  |

Copy each **Price ID** (`price_…`), not the product ID.

## 2. Keys and env vars

From Developers → API keys:

```
STRIPE_SECRET_KEY=sk_test_…            # server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRICE_SINGLE=price_…
STRIPE_PRICE_PICK3=price_…
STRIPE_PRICE_EVERYTHING=price_…
```

## 3. Webhook

Developers → Webhooks → Add endpoint:

- URL: `https://<your-domain>/api/stripe/webhook` (locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`)
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`
- Copy the **signing secret**:

```
STRIPE_WEBHOOK_SECRET=whsec_…
```

The webhook is the only place unlocks are granted. The success page never trusts the browser.

## 4. Checkout settings

- Settings → Checkout & Payment Links: enable **Apple Pay / Google Pay / Link** (wallets are on by default).
- Settings → Customer emails: enable "Successful payments" receipts (Stripe sends them; we also email our own).
- Payment methods: cards, Apple/Google Pay, and local methods for EUR (iDEAL, Bancontact, SEPA) if you like.

## 5. Promo codes

Product catalog → Coupons → create a coupon (e.g. `VALENTINE` 20% off, redeem-by Feb 15), then
"Add promotion code" so customers can type it. Checkout is created with `allow_promotion_codes: true`.

## 6. Test cards

`4242 4242 4242 4242` (any future date / any CVC) succeeds; `4000 0000 0000 3220` triggers 3-D Secure.

## What the code does with it

1. `POST /api/stripe/checkout` — signed-in user picks a product (+ template slugs for Single/Pick 3).
   Creates a `purchases` row (`pending`) and a Checkout Session with `client_reference_id = purchase id`,
   `metadata.user_id`, `metadata.product`, `metadata.template_slugs`, `automatic_tax`, and
   `success_url` back to the editor or pricing page.
2. `POST /api/stripe/webhook` — verifies the signature, marks the purchase `paid`, inserts
   `template_unlocks` (slug rows, or `'*'` for Everything), and emails a receipt. Refunds mark the
   purchase `refunded` and remove the unlocks it granted.
3. Publishing checks `has_template_unlock(user, slug)` — that's the entitlement.
