"use client";

import { useTranslations } from "next-intl";
import type { ReactionRow } from "@/lib/gift/dashboard";

export function ReactionList({ reactions, locale }: { reactions: ReactionRow[]; locale: string }) {
  const t = useTranslations("dashboard");
  if (reactions.length === 0) return <p className="mt-2 text-sm text-muted-foreground">{t("noReactions")}</p>;
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <ul className="mt-4 divide-y divide-border">
      {reactions.map((r) => (
        <li key={r.id} className="flex items-start gap-4 py-4">
          <span className="text-3xl">{r.emoji}</span>
          <div className="min-w-0 flex-1">
            {r.text ? <p className="text-[15px] leading-relaxed">{r.text}</p> : null}
            {r.audioUrl ? <audio controls preload="none" src={r.audioUrl} className="mt-2 h-10 w-full max-w-sm" /> : null}
            <p className="mt-1 text-xs text-muted-foreground">{fmt.format(new Date(r.created_at))}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
