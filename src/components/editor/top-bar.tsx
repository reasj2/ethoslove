"use client";

import { ArrowLeft, Check, CloudOff, Loader2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SaveState } from "@/lib/editor/types";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function TopBar({
  templateName,
  save,
  view,
  onView,
  onPublish,
  publishing,
}: {
  templateName: string;
  save: SaveState;
  view: "edit" | "preview";
  onView: (v: "edit" | "preview") => void;
  onPublish: () => void;
  publishing?: boolean;
}) {
  const t = useTranslations("editor");
  const saveLabel: Record<SaveState, { icon: React.ReactNode; text: string; tone: string }> = {
    idle: { icon: null, text: "", tone: "text-muted-foreground" },
    saving: { icon: <Loader2 className="size-3.5 animate-spin" />, text: t("saving"), tone: "text-muted-foreground" },
    saved: { icon: <Check className="size-3.5" />, text: t("saved"), tone: "text-moss" },
    offline: { icon: <CloudOff className="size-3.5" />, text: t("savedLocally"), tone: "text-muted-foreground" },
    error: { icon: <TriangleAlert className="size-3.5" />, text: t("saveError"), tone: "text-destructive" },
  };
  const s = saveLabel[save];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
        <Link href="/templates" className="flex items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm text-ink-soft hover:bg-ink/5" aria-label={t("back")}>
          <LogoMark className="size-6" />
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">{t("back")}</span>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display truncate text-[15px] italic sm:text-base">{templateName}</p>
          <p className={cn("hidden items-center justify-center gap-1 text-[11px] sm:flex", s.tone)}>
            {s.icon}
            {s.text}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border bg-card p-0.5 md:hidden" role="tablist">
            {(["edit", "preview"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => onView(v)}
                className={cn("h-8 rounded-full px-3 text-xs font-medium", view === v ? "bg-ink text-paper" : "text-ink-soft")}
              >
                {v === "edit" ? t("edit") : t("preview")}
              </button>
            ))}
          </div>
          <Button onClick={onPublish} disabled={publishing} className="h-9 rounded-full px-4 shadow-glow">
            {t("publish")}
          </Button>
        </div>
      </div>
    </header>
  );
}
