"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type View = { opened_at: string; device: string | null; watch_pct: number };

/**
 * Opens per day, last 30 days. One series → no legend; the title names it.
 * Bars are thin, anchored to the baseline with rounded data-ends, 2px apart, with a
 * per-bar hover tooltip and a table view for screen readers / print.
 */
export function OpensChart({ views, locale }: { views: View[]; locale: string }) {
  const t = useTranslations("dashboard");
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  const days = useMemo(() => {
    const out: { key: string; label: string; date: Date; count: number }[] = [];
    const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      out.push({ key: d.toISOString().slice(0, 10), label: fmt.format(d), date: d, count: 0 });
    }
    const index = new Map(out.map((d, i) => [d.key, i]));
    for (const v of views) {
      const k = new Date(v.opened_at).toISOString().slice(0, 10);
      const i = index.get(k);
      if (i !== undefined) out[i].count += 1;
    }
    return out;
  }, [views, locale]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  const W = 600;
  const H = 160;
  const padB = 22;
  const padT = 8;
  const gap = 2;
  const bw = (W - gap * (days.length - 1)) / days.length;
  const plotH = H - padB - padT;

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">{t("opensTotal", { n: total })}</p>
        <button type="button" onClick={() => setTable((v) => !v)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-ink">
          {table ? t("showChart") : t("showTable")}
        </button>
      </div>
      {table ? (
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">{t("opensOverTime")}</caption>
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 font-medium">{t("day")}</th>
              <th className="py-1 text-right font-medium">{t("opens")}</th>
            </tr>
          </thead>
          <tbody>
            {days.filter((d) => d.count > 0).map((d) => (
              <tr key={d.key} className="border-t border-border">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mt-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label={t("opensOverTime")} onMouseLeave={() => setHover(null)}>
            {/* baseline + one recessive gridline at the max */}
            <line x1={0} x2={W} y1={H - padB} y2={H - padB} stroke="var(--border)" strokeWidth={1} />
            <line x1={0} x2={W} y1={padT} y2={padT} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
            <text x={0} y={padT - 2} fontSize={10} fill="var(--muted-foreground)">{max}</text>
            {days.map((d, i) => {
              const h = d.count === 0 ? 0 : Math.max(4, (d.count / max) * plotH);
              const x = i * (bw + gap);
              const active = hover === i;
              return (
                <g key={d.key}>
                  {/* hit target bigger than the mark */}
                  <rect x={x - gap / 2} y={padT} width={bw + gap} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1} />
                  {h > 0 ? (
                    <path
                      d={`M${x},${H - padB} v${-(h - 4)} a4,4 0 0 1 4,-4 h${Math.max(0, bw - 8)} a4,4 0 0 1 4,4 v${h - 4} z`}
                      fill={active ? "var(--brand-coral-deep)" : "var(--brand-coral)"}
                    />
                  ) : null}
                  {i % 7 === 0 || i === days.length - 1 ? (
                    <text x={x + bw / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
                      {d.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          {hover !== null ? (
            <div
              className="pointer-events-none absolute -top-1 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-soft"
              style={{ left: `${((hover + 0.5) / days.length) * 100}%`, transform: "translateX(-50%)" }}
              role="status"
            >
              <span className="text-muted-foreground">{days[hover].label}</span>
              <span className="ml-2 font-semibold tabular-nums">{days[hover].count}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
