"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OCCASIONS, type Occasion } from "@/config/occasions";
import type { TemplateManifest, TemplateTier } from "@/templates/types";
import { cn } from "@/lib/utils";
import { TemplateCard } from "./template-card";

export function TemplateGallery({ manifests, initialOccasion }: { manifests: TemplateManifest[]; initialOccasion?: Occasion }) {
  const t = useTranslations();
  const [occasion, setOccasion] = useState<Occasion | "all">(initialOccasion ?? "all");
  const [tier, setTier] = useState<TemplateTier | "all">("all");

  const filtered = useMemo(
    () =>
      manifests.filter(
        (m) => (occasion === "all" || m.occasions.includes(occasion)) && (tier === "all" || m.tier === tier),
      ),
    [manifests, occasion, tier],
  );

  return (
    <div className="container-x pb-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={occasion === "all"} onClick={() => setOccasion("all")}>
            {t("templates.allOccasions")}
          </Chip>
          {OCCASIONS.map((o) => (
            <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>
              {t(`occasions.${o}`)}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "free", "premium"] as const).map((v) => (
            <Chip key={v} active={tier === v} onClick={() => setTier(v)}>
              {v === "all" ? t("templates.allTiers") : v === "free" ? t("common.free") : t("common.premium")}
            </Chip>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("templates.none")}</p>
      ) : (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m, i) => (
            <TemplateCard key={m.slug} manifest={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-line bg-transparent text-ink-soft hover:border-ink/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
