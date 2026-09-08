"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import type { GiftData, GiftLocale } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";
import type { TemplateEvent, TemplateMode, TemplateModule } from "../types";
import { loadTemplate } from "../registry";
import { giftThemeVars } from "./theme";
import { usePreloadAssets } from "./hooks/use-preload-assets";
import { LoadingScreen } from "./LoadingScreen";
import { introVariantFor } from "./intro-variants";
import { Watermark } from "./Watermark";
import { TemplateErrorBoundary } from "./ErrorBoundary";

const MIN_LOADING_MS = 1600;

export type GiftRendererProps = {
  slug: string;
  /** Omit in demo mode to use the template's bundled demo data. */
  data?: GiftData | null;
  mode: TemplateMode;
  demoLocale?: GiftLocale;
  onEvent?: (event: TemplateEvent) => void;
  onReact?: () => void;
  onMakeOne?: () => void;
  /** Change to remount the template (replay). */
  replayKey?: number;
  className?: string;
};

/**
 * The one place a template gets mounted: gallery demo, editor preview, recipient page.
 * Handles lazy loading, asset preloading, the branded loading screen, theming, errors
 * and the watermark. Templates only ever see `TemplateProps`.
 */
export function GiftRenderer({
  slug,
  data,
  mode,
  demoLocale = "en",
  onEvent,
  onReact,
  onMakeOne,
  replayKey = 0,
  className,
}: GiftRendererProps) {
  const [loaded, setLoaded] = useState<{ slug: string; mod: TemplateModule | null }>({ slug: "", mod: null });
  const [minElapsed, setMinElapsed] = useState(mode === "preview");
  const mod = loaded.slug === slug ? loaded.mod : null;
  const failed = loaded.slug === slug && loaded.mod === null && loaded.slug !== "";

  useEffect(() => {
    let active = true;
    loadTemplate(slug)
      .then((m) => active && setLoaded({ slug, mod: m }))
      .catch(() => active && setLoaded({ slug, mod: null }));
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (mode === "preview") return;
    const id = setTimeout(() => setMinElapsed(true), MIN_LOADING_MS);
    return () => clearTimeout(id);
  }, [mode, replayKey]);

  const resolved: GiftData | null = data ?? mod?.demoData[demoLocale] ?? mod?.demoData.en ?? null;
  const preload = usePreloadAssets(resolved, Boolean(mod) && mode !== "preview");
  const ready = Boolean(mod && resolved) && (mode === "preview" || (preload.done && minElapsed));

  const theme = useMemo(
    () => (resolved ? giftThemeVars(resolved.accentColor, resolved.fontPairing) : undefined),
    [resolved],
  );

  const Template = mod?.Template;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("gift-root relative isolate h-full w-full overflow-hidden bg-night text-paper [container-type:size]", className)}
        style={theme}
        data-mode={mode}
        data-template={slug}
      >
        {ready && Template && resolved ? (
          <TemplateErrorBoundary locale={resolved.locale}>
            <Template
              key={replayKey}
              data={resolved}
              mode={mode}
              onEvent={onEvent}
              onReact={onReact}
              onMakeOne={onMakeOne}
            />
          </TemplateErrorBoundary>
        ) : null}
        <AnimatePresence>
          {!ready ? (
            <LoadingScreen
              key="loading"
              recipientName={resolved?.recipientName}
              progress={mod ? preload.progress : 0}
              locale={resolved?.locale ?? demoLocale}
              variant={introVariantFor(slug, mod?.manifest)}
            />
          ) : null}
        </AnimatePresence>
        {failed ? (
          <div className="absolute inset-0 z-[70] grid place-items-center bg-night p-8 text-center text-paper">
            <p className="font-display text-xl">Unknown template “{slug}”.</p>
          </div>
        ) : null}
        {ready && resolved?.watermark && mode !== "preview" ? <Watermark locale={resolved.locale} /> : null}
      </div>
    </MotionConfig>
  );
}
