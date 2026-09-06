# Ethos — digital gifts that open like a story

A platform for creating personalised, animated, interactive gift pages — birthdays, anniversaries,
Valentine's, weddings, graduations, apologies, long distance, just because — shared by link or QR code.
The recipient opens it on their phone and gets a cinematic experience.

> Working brand name: **Ethos** (`src/config/brand.ts`). Change it there and it propagates everywhere.

## Stack

Next.js 16 (App Router, RSC, TypeScript strict) · Tailwind v4 + shadcn/ui · Motion (Framer) + GSAP +
React Three Fiber · Supabase (Postgres, Auth, Storage, RLS) · Stripe · Resend · next-intl (en, es) ·
PostHog · Sentry · Vitest · Playwright.

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — the app runs with no env vars at all
npm run dev
```

Open http://localhost:3000. Spanish lives at http://localhost:3000/es.

Without Supabase keys, auth and the dashboard render a "not connected" state; templates, the editor
and marketing pages work fully. That is deliberate: you can demo everything before creating any
third-party account.

## Connecting Supabase

1. Create a project at supabase.com and copy the URL + publishable key into `.env.local`.
2. Apply the schema: `supabase link --project-ref <ref>` then `npm run db:push`
   (or paste `supabase/migrations/0001_init.sql` into the SQL editor).
3. Auth → URL configuration: set Site URL to your domain and add `/auth/callback` and `/auth/confirm`
   as redirect URLs.
4. Auth → Providers: enable Google (and Apple, then set `NEXT_PUBLIC_AUTH_APPLE_ENABLED=true`).
5. Regenerate types when the schema changes: `npm run db:types`.

Local Supabase (needs Docker): `supabase start`, then use the printed local URL/keys.

## Scripts

| Script                | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                          |
| `npm run build`       | Production build                                |
| `npm run lint`        | ESLint                                          |
| `npm run typecheck`   | Route typegen + `tsc --noEmit`                  |
| `npm run test`        | Unit tests (Vitest)                             |
| `npm run test:e2e`    | Playwright e2e (needs `npx playwright install chromium`) |
| `npm run format`      | Prettier                                        |
| `npm run db:push`     | Apply migrations to the linked Supabase project |
| `npm run db:types`    | Regenerate `src/lib/supabase/types.ts`          |

## Environment variables

See `.env.example`. Everything is optional in development; `src/lib/env.ts` exposes
`isConfigured.*` flags so features degrade gracefully.

## Project layout

```
src/app/[locale]/(marketing)   homepage, templates, occasions, pricing, legal
src/app/[locale]/(app)         dashboard, account   — authenticated, dark-mode capable
src/app/[locale]/(editor)      /create/[templateSlug]
src/app/[locale]/(gift)        /g/[shortId]         — recipient page, no chrome
src/app/auth/*                 Supabase auth callbacks (outside i18n routing)
src/templates/                 the template system (see docs/ARCHITECTURE.md)
src/components/{ui,marketing,app,auth,shared}
src/lib/{supabase,auth,env}    infrastructure
src/config/{brand,site,occasions}
messages/{en,es}.json          translations
supabase/migrations            schema + RLS + storage policies
tests/{unit,e2e}
```

Read `docs/ARCHITECTURE.md` before adding a template.

## Roadmap (build phases)

1. ✅ Scaffold — Next, Tailwind, shadcn, Supabase, auth, i18n, design tokens, layout shell, CI
2. ✅ Template engine + The Letter + Constellations (live demos at /templates, /demo/[slug])
3. Editor
4. Recipient page
5. Payments + dashboard
6. Marketing site
7. Templates 3–12
8. Polish — emails, analytics, Sentry, tests, Lighthouse, Spanish, accessibility
