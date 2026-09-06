"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GiftLocale } from "@/lib/gift/schema";
import { PhoneFrame } from "@/components/shared/phone-frame";
import { GiftRenderer } from "@/templates/_shared/GiftRenderer";

export function TemplatePhonePreview({ slug, locale, autoStart = false }: { slug: string; locale: GiftLocale; autoStart?: boolean }) {
  const t = useTranslations("templates");
  const [live, setLive] = useState(autoStart);
  return (
    <PhoneFrame width={340} className="mx-auto max-w-full">
      {live ? (
        <GiftRenderer slug={slug} mode="demo" demoLocale={locale} />
      ) : (
        <button
          type="button"
          onClick={() => setLive(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-night text-paper"
        >
          <span className="grid size-14 place-items-center rounded-full bg-coral text-paper shadow-glow">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
          <span className="text-sm text-paper/70">{t("tryDemo")}</span>
        </button>
      )}
    </PhoneFrame>
  );
}
