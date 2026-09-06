"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import type { GiftLocale } from "@/lib/gift/schema";
import { GiftRenderer } from "@/templates/_shared/GiftRenderer";
import { LogoMark } from "@/components/shared/logo";

/**
 * Full-screen live demo. The control strip sits in its own row above the template so it
 * never covers template controls (templates assume they own the whole viewport).
 */
export function DemoStage({ slug, backHref = "/templates" }: { slug: string; backHref?: string }) {
  const locale = useLocale() as GiftLocale;
  const router = useRouter();
  const t = useTranslations("templates");
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="flex h-dvh w-full flex-col bg-night">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-night px-3 pt-[env(safe-area-inset-top)]">
        <Link href={backHref} className="flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-white/80 hover:bg-white/10">
          <LogoMark className="size-5" />
          <ArrowLeft className="size-3.5" />
          {t("backToGallery")}
        </Link>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setReplayKey((k) => k + 1)} className="grid size-8 place-items-center rounded-full text-white/80 hover:bg-white/10" aria-label={t("replay")}>
            <RotateCcw className="size-3.5" />
          </button>
          <Link href={`/create/${slug}`} className="flex h-8 items-center gap-1.5 rounded-full bg-coral px-3 text-xs font-semibold text-white hover:bg-coral-deep">
            <Sparkles className="size-3.5" />
            {t("useTemplate")}
          </Link>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <GiftRenderer
          slug={slug}
          mode="demo"
          demoLocale={locale}
          replayKey={replayKey}
          onReact={() => toast(t("demoReactionToast"))}
          onMakeOne={() => router.push(`/create/${slug}`)}
        />
      </div>
    </div>
  );
}
