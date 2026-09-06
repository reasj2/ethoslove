import { Construction } from "lucide-react";

/** Temporary scaffold marker. Delete when the phase that owns the page ships. */
export function PhaseNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x pb-20">
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold/5 p-5 text-sm text-ink-soft">
        <Construction className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
        <p>{children}</p>
      </div>
    </div>
  );
}
