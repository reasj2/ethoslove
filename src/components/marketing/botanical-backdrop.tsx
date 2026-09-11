import { FlowerHead } from "@/templates/bouquet/art";
import { FLOWERS, type FlowerId } from "@/templates/bouquet/catalogue";
import { cn } from "@/lib/utils";

/** `phone: false` keeps a bloom off small screens, where it would sit behind the words. */
type Bloom = { id: FlowerId; color: string; x: number; y: number; size: number; rot: number; blur?: number; opacity?: number; phone?: boolean };

/** Blooms around the edges, mostly spilling off them, so they frame the words instead of covering them. */
const FRAME: Bloom[] = [
  { id: "peony", color: "blush", x: -4, y: 4, size: 20, rot: -14 },
  { id: "eucalyptus", color: "sage", x: -2, y: 38, size: 12, rot: 38, opacity: 0.6, phone: false },
  { id: "ranunculus", color: "peach", x: -4, y: 96, size: 17, rot: 8, blur: 1 },
  { id: "rose", color: "white", x: 44, y: 106, size: 16, rot: 22, blur: 6, opacity: 0.45, phone: false },
  { id: "peony", color: "white", x: 99, y: 6, size: 20, rot: 20, blur: 3, opacity: 0.5 },
  { id: "fern", color: "green", x: 100, y: 34, size: 15, rot: -30, opacity: 0.55, phone: false },
  { id: "rose", color: "blush", x: 102, y: 58, size: 17, rot: -8, blur: 1, opacity: 0.9, phone: false },
  { id: "cosmos", color: "pink", x: 95, y: 94, size: 11, rot: 30 },
  { id: "peony", color: "coral", x: 74, y: 108, size: 22, rot: -20, blur: 6, opacity: 0.4, phone: false },
];

/**
 * The night garden behind the hero and the closing section: a deep green ground, our own
 * flowers from the Bouquet template around the edges, some soft with depth, and a vignette.
 */
export function BotanicalBackdrop({ className, blooms = FRAME }: { className?: string; blooms?: Bloom[] }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(85% 70% at 30% 22%, #21402f 0%, #0f2219 55%, #09150f 100%)" }} />
      {blooms.map((b, i) => (
        <svg
          key={i}
          viewBox="-60 -60 120 120"
          className={cn("absolute", b.phone === false && "hidden md:block")}
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `clamp(${Math.round(b.size * 3.6)}px, ${b.size}vw, ${b.size * 15}px)`,
            transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
            filter: b.blur ? `blur(${b.blur}px)` : undefined,
            opacity: b.opacity ?? 1,
          }}
        >
          <FlowerHead id={b.id} tone={FLOWERS[b.id].colors[b.color] ?? Object.values(FLOWERS[b.id].colors)[0]} uid={`bb${i}`} seed={i * 97 + 11} />
        </svg>
      ))}
      <div className="grain-overlay opacity-[0.1] mix-blend-overlay" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(6,14,10,0.55) 100%)" }} />
    </div>
  );
}
