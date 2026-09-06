"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import { GiftRenderer } from "@/templates/_shared/GiftRenderer";

/** Full-screen live demo of a template with a thin control strip. */
export function DemoStage({ slug, backHref = "/templates" }: { slug: string; backHref?: string }) {
  const locale = useLocale() as GiftLocale;
  const router = useRouter();
  const t = useTranslations("templates");
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="relative h-dvh w-full bg-night">
      <GiftRenderer
        slug={slug}
        mode="demo"
        demoLocale={locale}
        replayKey={replayKey}
        onReact={() => toast(t("demoReactionToast"))}
        onMakeOne={() => router.push(`/create/${slug}`)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[80] flex items-center justify-between px-3">
        <Link
          href={backHref}
          className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-full bg-black/40 px-3 text-xs font-medium text-white/90 backdrop-blur-md hover:bg-black/55"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToGallery")}
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="grid size-9 place-items-center rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/55"
            aria-label={t("replay")}
          >
            <RotateCcw className="size-3.5" />
          </button>
          <Link
            href={`/create/${slug}`}
            className="flex h-9 items-center gap-1.5 rounded-full bg-coral px-3.5 text-xs font-semibold text-white shadow-glow hover:bg-coral-deep"
          >
            <Sparkles className="size-3.5" />
            {t("useTemplate")}
          </Link>
        </div>
      </div>
    </div>
  );
}
