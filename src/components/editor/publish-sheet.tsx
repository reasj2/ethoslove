"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import type { TemplateManifest } from "@/templates/types";
import { decidePublish, readinessProblems } from "@/lib/gift/publish";
import { useEditor } from "@/lib/editor/store";
import { getEntitlement, publishGift } from "@/app/actions/gift";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AuthForm } from "@/components/auth/auth-form";
import { cn } from "@/lib/utils";
import { ShareScreen } from "./share-screen";

export function PublishSheet({
  open,
  onOpenChange,
  manifest,
  slug,
  supabaseConfigured,
  paymentsEnabled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  manifest: TemplateManifest;
  slug: string;
  supabaseConfigured: boolean;
  paymentsEnabled: boolean;
}) {
  const t = useTranslations("editor.publishSheet");
  const locale = useLocale() as GiftLocale;
  const router = useRouter();
  const state = useEditor();
  const [fetchedEntitlement, setFetchedEntitlement] = useState<{ unlocked: boolean } | null>(null);
  const entitlement = state.authed ? fetchedEntitlement : { unlocked: false };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ shortId: string; status: "live" | "scheduled" } | null>(null);

  // Opening the sheet kicks uploads + a fresh entitlement check.
  useEffect(() => {
    if (!open || !state.authed) return;
    void state.ensureRemote();
    getEntitlement(slug).then(setFetchedEntitlement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, state.authed, slug]);

  const serialized = useMemo(() => (state.hydrated ? state.serializedForServer() : null), [state]);
  const uploadsInFlight = Object.values(state.assets).some((a) => a.status === "uploading" || a.status === "processing");
  const problems = useMemo(() => {
    if (!serialized) return ["uploadsPending"];
    const p = readinessProblems(manifest, serialized);
    if (uploadsInFlight && !p.includes("uploadsPending")) p.push("uploadsPending");
    return p;
  }, [manifest, serialized, uploadsInFlight]);

  const options = { removeWatermark: state.removeWatermark, schedule: state.schedule.enabled, password: state.password.length > 0 };
  const decision = entitlement && serialized ? decidePublish(manifest, serialized, entitlement, options) : null;
  const premiumFeatures = [
    manifest.tier === "premium" && t("featurePremiumTemplate"),
    options.removeWatermark && t("featureNoWatermark"),
    options.schedule && t("featureSchedule"),
    options.password && t("featurePassword"),
    (serialized?.photos.length ?? 0) > 10 && t("featurePhotos"),
  ].filter(Boolean) as string[];

  const publish = async () => {
    setBusy(true);
    setError(null);
    const giftId = await state.ensureRemote();
    if (!giftId) {
      setBusy(false);
      setError("no_gift");
      return;
    }
    await state.uploadPending();
    const result = await publishGift({
      giftId,
      data: useEditor.getState().serializedForServer(),
      removeWatermark: state.removeWatermark,
      password: state.password || undefined,
      schedule: state.schedule.enabled && state.schedule.unlockAt ? { unlockAt: state.schedule.unlockAt, timezone: state.schedule.timezone } : undefined,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    state.markPublished(result.data.shortId, result.data.status);
    setPublished(result.data);
  };

  const next = `/create/${slug}?resume=publish`;
  if (!state.hydrated) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) setError(null);
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto bg-paper p-0 sm:max-w-lg">
        {published ? (
          <ShareScreen shortId={published.shortId} status={published.status} unlockAt={state.schedule.enabled ? state.schedule.unlockAt : undefined} data={state.data} giftId={state.giftId} />
        ) : (
          <div className="px-6 pt-8 pb-10 sm:px-8">
            <SheetHeader className="p-0 text-left">
              <SheetTitle className="font-display text-3xl">{t("title")}</SheetTitle>
              <SheetDescription>{t("subtitle", { name: state.data.recipientName || "…" })}</SheetDescription>
            </SheetHeader>

            {!supabaseConfigured ? (
              <Notice tone="warn" className="mt-6">{t("notConfigured")}</Notice>
            ) : null}

            <section className="mt-7">
              <p className="text-eyebrow mb-3 text-ink-soft">{t("checklist")}</p>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {(["recipientName", "senderName", "message", "photosMin", "uploadsPending"] as const).map((key) => {
                  const bad = problems.includes(key);
                  const label = t(`problems.${key}`, { min: manifest.features.photos.min });
                  return (
                    <li key={key} className={cn("flex items-center gap-3 px-4 py-3 text-sm", bad ? "text-ink" : "text-muted-foreground line-through decoration-moss/60")}>
                      {bad ? key === "uploadsPending" ? <Loader2 className="size-4 animate-spin text-coral" /> : <AlertCircle className="size-4 text-coral" /> : <Check className="size-4 text-moss" />}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </section>

            {!state.authed && supabaseConfigured ? (
              <section className="mt-7 rounded-2xl border border-border bg-card p-5">
                <p className="font-display text-xl">{t("signInTitle")}</p>
                <p className="mt-1 mb-4 text-sm text-muted-foreground">{t("signInBlurb")}</p>
                <AuthForm mode="login" next={next} compact />
              </section>
            ) : null}

            {state.authed && decision && !decision.ok && decision.reason === "payment_required" ? (
              <section className="mt-7 rounded-2xl border border-gold/60 bg-gold/5 p-5">
                <p className="flex items-center gap-2 font-display text-xl">
                  <Lock className="size-4 text-gold-deep" />
                  {t("paymentTitle")}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{t("paymentBlurb", { features: premiumFeatures.join(", ") })}</p>
                {paymentsEnabled ? (
                  <Button className="mt-4 h-11 rounded-full" onClick={() => router.push(`/pricing?template=${slug}&return=${encodeURIComponent(next)}`)}>
                    {t("paymentTitle")}
                  </Button>
                ) : (
                  <Notice tone="info" className="mt-4">{t("paymentSoon")}</Notice>
                )}
              </section>
            ) : null}

            {error ? <Notice tone="warn" className="mt-6">{t("error", { error })}</Notice> : null}

            <Button
              className="mt-8 h-12 w-full rounded-full text-base shadow-glow"
              disabled={!supabaseConfigured || !state.authed || busy || problems.length > 0 || !decision?.ok}
              onClick={publish}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? t("publishing") : state.schedule.enabled ? t("publishScheduled") : t("publishNow")}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{locale === "es" ? "Sin suscripción. Pagas una vez y es tuyo para siempre." : "No subscription. Pay once, keep forever."}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Notice({ tone, className, children }: { tone: "warn" | "info"; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border p-3.5 text-sm", tone === "warn" ? "border-coral/40 bg-coral/5 text-ink" : "border-border bg-card text-ink-soft", className)}>{children}</div>
  );
}
