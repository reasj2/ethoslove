/**
 * Turns the sender's stems into a bouquet: where every head sits, how big, which way it
 * leans. Pure and seeded, so the editor preview, the recipient and the thumbnails all get
 * the same bouquet, and "shuffle" just means a new seed.
 */
import { hashString, mulberry32 } from "../_shared/random";
import { FLOWERS, MAX_STEMS, toneOf, type FlowerId, type Tone } from "./catalogue";
import type { Stem } from "./schema";

/** In the bouquet's 400 × 600 drawing: where the ribbon ties the stems together. */
export const NECK = { x: 200, y: 468 };
const DOME = { x: 200, y: 258 };

export type PlacedHead = { key: string; id: FlowerId; tone: Tone; x: number; y: number; rot: number; scale: number; seed: number };
export type PlacedSpray = { key: string; id: FlowerId; tone: Tone; angle: number; length: number; seed: number };
export type Arrangement = { greens: PlacedSpray[]; fillers: PlacedSpray[]; heads: PlacedHead[] };

export function expandStems(stems: Stem[]): { id: FlowerId; color: string }[] {
  const out: { id: FlowerId; color: string }[] = [];
  for (const s of stems) for (let i = 0; i < s.count && out.length < MAX_STEMS; i++) out.push({ id: s.flower, color: s.color });
  return out;
}

export function arrange(stems: Stem[], seed: number): Arrangement {
  const rng = mulberry32(Math.imul(seed + 1, 2654435761) ^ hashString(JSON.stringify(stems)));
  const all = expandStems(stems);
  const focal = all.filter((s) => FLOWERS[s.id].role === "focal");
  const fillers = all.filter((s) => FLOWERS[s.id].role === "filler");
  const greens = all.filter((s) => FLOWERS[s.id].role === "green");

  // Two ferns always frame the back, so no bouquet is ever just heads on sticks.
  const greenStems = [{ id: "fern" as FlowerId, color: "green" }, { id: "fern" as FlowerId, color: "green" }, ...greens];
  const placedGreens: PlacedSpray[] = greenStems.map((s, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    // Steep enough to rise out of the top of the paper, not out of its sides.
    const angle = side * (14 + ((i * 11) % 20)) + (rng() - 0.5) * 8;
    return { key: `g${i}`, id: s.id, tone: toneOf(s.id, s.color).tone, angle, length: 280 + rng() * 45, seed: Math.floor(rng() * 1e6) };
  });

  const n = focal.length;
  // Fewer blooms sit bigger and closer together; a full bouquet spreads into a wider dome.
  const spread = Math.min(1, 0.52 + n * 0.05);
  const rx = 128 * spread;
  const ry = 90 * spread;
  const base = Math.min(1.35, Math.max(0.7, 1.5 - n * 0.04));
  const phase = rng() * Math.PI * 2;
  const ordered = [...focal].sort((a, b) => FLOWERS[b.id].size - FLOWERS[a.id].size);
  const heads: PlacedHead[] = ordered.map((s, i) => {
    const r = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996 + phase;
    const x = DOME.x + r * rx * Math.cos(a) + (rng() - 0.5) * 10;
    const y = DOME.y + r * ry * Math.sin(a) + (rng() - 0.5) * 8;
    const lean = (Math.atan2(x - NECK.x, NECK.y - y) * 180) / Math.PI;
    const rot = s.id === "tulip" ? lean : rng() * 360;
    const scale = base * FLOWERS[s.id].size * (0.9 + rng() * 0.16);
    return { key: `h${i}`, id: s.id, tone: toneOf(s.id, s.color).tone, x, y, rot, scale, seed: Math.floor(rng() * 1e6) };
  });
  // Paint from the back of the dome to the front.
  heads.sort((p, q) => p.y - q.y);

  const placedFillers: PlacedSpray[] = fillers.map((s, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const angle = side * (8 + ((i * 17) % 40)) + (rng() - 0.5) * 10;
    const reach = Math.hypot(rx * Math.sin((angle * Math.PI) / 180), NECK.y - DOME.y + ry * 0.7);
    return { key: `f${i}`, id: s.id, tone: toneOf(s.id, s.color).tone, angle, length: reach + 20 + rng() * 25, seed: Math.floor(rng() * 1e6) };
  });

  return { greens: placedGreens, fillers: placedFillers, heads };
}

/** Seconds the bouquet takes to come together, so the card knows when to appear. */
export function assemblySeconds(arr: Arrangement): number {
  return 1.3 + arr.heads.length * 0.12 + 1.5;
}
