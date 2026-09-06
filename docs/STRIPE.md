# Stripe setup

This is the exact click-path for the Stripe Dashboard, written against the current
"Add a product" dialog. The account is shared with other products (Migla.io), so every
name below is prefixed with **Ethos** and the code sets the statement descriptor suffix
`ETHOS` so the charges stay recognisable.

Do everything once with the **Test mode** toggle on, run a test purchase, then repeat in
live mode. Nothing in the code changes between the two except the keys.

## 1. Three products, one price each

Product catalog → **Add product**. Fill the dialog like this, three times:

| Field                      | Single template                                                                 | Pick 3                                                                 | Everything                                                                              |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Name**                   | `Ethos — One template`                                                          | `Ethos — Pick three`                                                   | `Ethos — Everything`                                                                    |
| **Description**            | One premium gift template, unlocked on your account forever. No subscription.   | Any three premium templates, unlocked forever. No subscription.        | Every template, current and future, unlocked forever. No subscription.                  |
| **Image**                  | optional (`public/icon-email.png` works)                                        | optional                                                               | optional                                                                                |
| **Product category**       | keep the preset **General – Electronically Supplied Services**                  | same                                                                   | same                                                                                    |
| **Pricing**                | **One-off** (not Recurring — the dialog defaults to Recurring)                  | One-off                                                                | One-off                                                                                 |
| **Amount**                 | `7.49` EUR                                                                      | `10.99` EUR                                                            | `22.99` EUR                                                                             |
| **Include tax in price**   | **Yes**                                                                         | Yes                                                                    | Yes                                                                                     |

Then **Add product**. Leave *Billing period* alone; it disappears once One-off is selected.

Why these settings:

- **One-off** is what the code sends (`mode: "payment"`). A recurring price would make Checkout fail.
- **Electronically Supplied Services** is the tax category for digital goods sold to consumers
  in the EU (VAT is due where the buyer lives). It only matters if Stripe Tax is on.
- **Include tax in price = Yes** because the site shows consumer prices with VAT included
  (Terms, section 5). With Stripe Tax on, Stripe carves the VAT out of the 7.49 instead of
  adding it on top; buyers outside the EU pay the same 7.49 with no tax line.
- EUR is the account's settlement currency, so it is the price's base currency. The code
  asks Stripe which currencies a price carries and falls back to EUR for everyone else, so
  **you can stop here**. If you later want local pricing, open the product → the price →
  add currency options `USD 7.99 / 11.99 / 24.99` and `GBP 6.49 / 9.49 / 19.99`
  (those are the amounts in `src/lib/pricing/products.ts`).

After saving, copy either the three **Product IDs** (`prod_…`, shown in the product list)
or the three **Price IDs** (`price_…`, inside each product). Product IDs are enough: the
code charges each product's default price. Price IDs only matter if a product has several
prices and you want a specific one.

## 2. Keys → `.env.local`

Developers → API keys (test mode):

```
STRIPE_SECRET_KEY=sk_test_…             # "Secret key" — server only, never NEXT_PUBLIC
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRODUCT_SINGLE=prod_…            # Ethos — One template
STRIPE_PRODUCT_PICK3=prod_…             # Ethos — Pick three
STRIPE_PRODUCT_EVERYTHING=prod_…        # Ethos — Everything
# or, instead of the products, STRIPE_PRICE_SINGLE / STRIPE_PRICE_PICK3 / STRIPE_PRICE_EVERYTHING
```

Restart `npm run dev` after editing `.env.local`.

## 3. Statement descriptor (once per account)

Settings → Business → Public details → **Statement descriptor**. The code appends the
suffix `ETHOS` to whatever short descriptor the account has (Stripe shows it as
`MIGLA* ETHOS`-style). The account's *shortened descriptor* must be set and the total
must stay under 22 characters, or Stripe rejects the suffix at checkout.

## 4. Tax (optional, recommended before going live)

Settings → Tax:

1. Add the Latvian VAT registration (LV40203733943) and, if you sell across the EU, the
   **OSS (One-Stop Shop)** registration.
2. Turn on Stripe Tax, then set in `.env.local`:

```
STRIPE_AUTOMATIC_TAX=true
```

With that flag the checkout session is created with `automatic_tax: { enabled: true }` and
Stripe works out the VAT from the buyer's billing address. Without it, Stripe charges the
gross amount and tax stays your accountant's job. Either way the code works.

## 5. Webhook (after the first deploy)

Developers → Webhooks → **Add endpoint**:

- Endpoint URL: `https://<your-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`
- Copy the **Signing secret**:

```
STRIPE_WEBHOOK_SECRET=whsec_…
```

Until the webhook exists, the success page fulfils the purchase itself by re-reading the
session from Stripe, so local testing works without the Stripe CLI. The webhook is still
required in production: it is what handles refunds and payments that finish after the
buyer closed the tab.

## 6. Checkout settings worth switching on

- Settings → Checkout & Payment Links: Apple Pay, Google Pay and Link (on by default).
- Settings → Payment methods: cards plus iDEAL, Bancontact and SEPA for EUR buyers.
- Settings → Customer emails: "Successful payments" on. Stripe sends its receipt; the app
  sends its own confirmation with the unlocked templates.
- Product catalog → Coupons: create a coupon, then **Add promotion code** (for example
  `VALENTINE`, 20% off, expiring mid-February). Checkout already allows promotion codes.

## 7. Test it

1. Sign in on the site, open Pricing, pick **Everything**.
2. Pay with `4242 4242 4242 4242`, any future expiry, any CVC. `4000 0000 0000 3220`
   forces a 3-D Secure challenge.
3. You should land on `/checkout/success`, get the receipt email (if Resend is set up),
   and see the unlock on the dashboard. Publishing a premium template now works.
4. Refund the payment in the Dashboard: the webhook (once configured) removes the unlock.

## What the code does with all of it

1. `POST /api/stripe/checkout` — signed-in user picks a product (+ template slugs for
   Single/Pick 3). Creates a `purchases` row (`pending`), reads the price's currency options,
   and creates a Checkout Session with `client_reference_id = purchase id`, metadata
   (`user_id`, `product`, `template_slugs`), `allow_promotion_codes`, the `ETHOS` descriptor
   suffix, optional `automatic_tax`, and a `success_url` back to the editor or dashboard.
2. `POST /api/stripe/webhook` — verifies the signature, marks the purchase `paid`, inserts
   `template_unlocks` (slug rows, or `'*'` for Everything), emails a receipt. Refunds mark the
   purchase `refunded` and remove the unlocks it granted.
3. Publishing checks `has_template_unlock(user, slug)`. That is the entitlement; nothing
   client-side is trusted.
