import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  help,
  counter,
  badge,
  className,
  children,
}: {
  id?: string;
  label: string;
  help?: string;
  counter?: string;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="flex items-center gap-2 text-[13px] font-medium text-ink">
          {label}
          {badge}
        </Label>
        {counter ? <span className="text-[11px] tabular-nums text-muted-foreground">{counter}</span> : null}
      </div>
      {children}
      {help ? <p className="text-xs leading-relaxed text-muted-foreground">{help}</p> : null}
    </div>
  );
}

export function SectionHeader({ n, title, blurb, badge }: { n: string; title: string; blurb: string; badge?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <p className="font-display text-[13px] tracking-[0.2em] text-coral italic">{n}</p>
      <h2 className="font-display mt-1 flex items-center gap-2.5 text-[1.65rem] leading-tight">
        {title}
        {badge}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
    </header>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; hint?: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("grid gap-2", options.length > 3 ? "grid-cols-2" : `grid-cols-${options.length}`, className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-11 flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
              active ? "border-ink bg-ink text-paper" : "border-border bg-card hover:border-ink/40",
            )}
          >
            <span className="font-medium">{o.label}</span>
            {o.hint ? <span className={cn("mt-0.5 text-[11px]", active ? "text-paper/70" : "text-muted-foreground")}>{o.hint}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function PremiumBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gold/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink uppercase">{label}</span>
  );
}
