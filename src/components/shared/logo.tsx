import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

/**
 * Brand mark: a wax seal — a circle with a soft inner impression.
 * Draws with currentColor so it inherits text colour, with a coral fill option.
 */
export function LogoMark({ className, tone = "coral" }: { className?: string; tone?: "coral" | "ink" | "paper" }) {
  const fill = tone === "coral" ? "var(--brand-coral)" : tone === "ink" ? "var(--brand-ink)" : "var(--brand-paper)";
  const inner = tone === "paper" ? "var(--brand-ink)" : "#FFF8F4";
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      fill="none"
    >
      <path
        d="M16 2.5c1.3 0 2 1.2 3.3 1.5s2.6-.5 3.7.3 1 2.2 1.9 3.2 2.4 1.2 2.9 2.4-.3 2.5 0 3.8 1.6 2.1 1.6 3.4-1.3 2.1-1.6 3.4.5 2.7 0 3.8-2 1.5-2.9 2.4-.8 2.5-1.9 3.2-2.4-.1-3.7.3S17.3 32 16 32s-2-1.2-3.3-1.5-2.6.5-3.7-.3-1-2.2-1.9-3.2-2.4-1.2-2.9-2.4.3-2.5 0-3.8S2.5 18.7 2.5 17.4s1.3-2.1 1.6-3.4-.5-2.7 0-3.8 2-1.5 2.9-2.4.8-2.5 1.9-3.2 2.4.1 3.7-.3S14.7 2.5 16 2.5Z"
        fill={fill}
      />
      <path
        d="M16 10.2c-1.9-2.4-5.6-1.8-6.4 1.2-.6 2.3.9 4.2 2.7 5.8l3.7 3.3 3.7-3.3c1.8-1.6 3.3-3.5 2.7-5.8-.8-3-4.5-3.6-6.4-1.2Z"
        fill={inner}
        opacity="0.95"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-[1.45rem] leading-none tracking-tight italic",
        className,
      )}
      style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1' }}
    >
      {BRAND.name}
    </span>
  );
}

export function Logo({ className, tone }: { className?: string; tone?: "coral" | "ink" | "paper" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark tone={tone} />
      <Wordmark />
    </span>
  );
}
