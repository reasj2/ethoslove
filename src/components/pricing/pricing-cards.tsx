"use client";

import { useState } from "react";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import { PRODUCTS, PRODUCT_ORDER, formatAmount, type Currency, type ProductId } from "@/lib/pricing/products";
import type { TemplateManifest } from "@/templates/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PricingCards({
  currency,
  manifests,
  authed,
  paymentsEnabled,
  preselect,
  returnTo,
}: {
  currency: Currency;
  manifests: TemplateManifest[];
  authed: boolean;
  paymentsEnabled: boolean;
  preselect?: string;
  returnTo?: string;
}) {
  const t = useTranslations("pricing");
  const locale = useLocale() as GiftLocale;
  const router = useRouter();
  const [picking, setPicking] = useState<ProductId | null>(null);
  const [chosen, setChosen] = useState<string[]>(preselect ? [preselect] : []);
  const [busy, setBusy] = useState(false);

  const start = async (product: ProductId, slugs: string[]) => {
    if (!authed) {
      router.push(`/login?next=${encodeURIComponent(`/pricing${preselect ? `?template=${preselect}` : ""}`)}`);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product, templateSlugs: slugs, currency, returnTo }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    setBusy(false);
    if (json.url) window.location.assign(json.url);
    else toast.error(t("checkoutError"));
  };

  const choose = (product: ProductId) => {
    if (!paymentsEnabled) {
      toast(t("comingSoon"));
      return;
    }
    if (product === "everything") return void start(product, []);
    setChosen(preselect ? [preselect] : []);
    setPicking(product);
  };

  const needed = picking ? PRODUCTS[picking].picks : 0;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {PRODUCT_ORDER.map((id) => {
          const p = PRODUCTS[id];
          const dominant = p.highlight;
          const features = t.raw(`plans.${id}.features`) as string[];
          return (
            <article
              key={id}
              className={cn(
                "relative flex flex-col rounded-[1.75rem] border p-7 sm:p-8",
                dominant ? "border-ink bg-ink text-paper shadow-lift lg:-my-4 lg:py-12" : "border-border bg-card",
              )}
            >
              {dominant ? (
                <span className="absolute -top-3 left-7 flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase">
                  <Crown className="size-3" />
                  {t("bestValue")}
                </span>
              ) : null}
              <h3 className="font-display text-2xl">{t(`plans.${id}.name`)}</h3>
              <p className={cn("mt-1 text-sm", dominant ? "text-paper/65" : "text-muted-foreground")}>{t(`plans.${id}.blurb`)}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-[3.2rem] leading-none tracking-tight">{formatAmount(p.amounts[currency], currency, locale)}</span>
                {p.compareAt ? <span className={cn("mb-2 text-sm line-through", dominant ? "text-paper/45" : "text-muted-foreground")}>{formatAmount(p.compareAt[currency], currency, locale)}</span> : null}
              </div>
              <p className={cn("mt-2 text-xs", dominant ? "text-paper/60" : "text-muted-foreground")}>{t("oneTime")}</p>
              <ul className="mt-6 flex flex-col gap-2.5 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={cn("mt-0.5 size-4 shrink-0", dominant ? "text-gold" : "text-coral")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choose(id)}
                disabled={busy}
                className={cn(
                  "mt-8 flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-transform active:scale-[0.98]",
                  dominant ? "bg-coral text-paper shadow-glow" : "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
                )}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : dominant ? <Sparkles className="size-4" /> : null}
                {t(`plans.${id}.cta`)}
              </button>
              {dominant ? <p className="mt-3 text-center text-xs text-paper/55">{t("priority")}</p> : null}
            </article>
          );
        })}
      </div>

      <Dialog open={picking !== null} onOpenChange={(v) => !v && setPicking(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("pick.title", { n: needed })}</DialogTitle>
            <DialogDescription>{t("pick.blurb")}</DialogDescription>
          </DialogHeader>
          <ul className="grid max-h-[50dvh] gap-2 overflow-y-auto">
            {manifests.map((m) => {
              const on = chosen.includes(m.slug);
              return (
                <li key={m.slug}>
                  <button
                    type="button"
                    onClick={() => setChosen((c) => (on ? c.filter((s) => s !== m.slug) : c.length < needed ? [...c, m.slug] : c))}
                    className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left", on ? "border-ink bg-ink/5" : "border-border")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumbnail.poster} alt="" className="h-14 w-10 rounded-md object-cover" />
                    <span className="flex-1">
                      <span className="block font-medium">{m.name[locale]}</span>
                      <span className="block text-xs text-muted-foreground">{m.tagline[locale]}</span>
                    </span>
                    <span className={cn("grid size-5 place-items-center rounded-full border", on ? "border-coral bg-coral text-paper" : "border-border")}>{on ? <Check className="size-3" /> : null}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            disabled={chosen.length !== needed || busy}
            onClick={() => picking && start(picking, chosen)}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-semibold text-paper shadow-glow disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("pick.continue", { n: chosen.length, total: needed })}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
