/**
 * The flowers, drawn in SVG. Every head is centred on 0,0 and about 100 units across; sprays
 * (fillers and greens) grow upwards from 0,0. A seeded wobble on every petal keeps two roses
 * from ever being identical, which is most of what makes them read as drawn rather than stamped.
 */
import type { ReactElement } from "react";
import { mulberry32 } from "../_shared/random";
import type { FlowerId, Tone } from "./catalogue";

type Rng = () => number;
type Tip = "round" | "point" | "notch" | "ruffle";

const r1 = (v: number) => Math.round(v * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (r: number, a: number) => `${r1(r * Math.cos(a))} ${r1(r * Math.sin(a))}`;

export function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

const inkOf = (tone: Tone) => mix(tone.deep, "#2B1B1E", 0.45);

/** One petal, base at 0,0, pointing up. */
function petal(len: number, w: number, tip: Tip, rng: Rng): string {
  const j = () => 1 + (rng() - 0.5) * 0.18;
  const L = len;
  const W = w;
  switch (tip) {
    case "point":
      return `M0 0C${r1(W * 0.62 * j())} ${r1(-L * 0.12)} ${r1(W * 0.95 * j())} ${r1(-L * 0.52 * j())} ${r1((rng() - 0.5) * W * 0.14)} ${r1(-L)}C${r1(-W * 0.95 * j())} ${r1(-L * 0.52 * j())} ${r1(-W * 0.62 * j())} ${r1(-L * 0.12)} 0 0Z`;
    case "notch":
      return `M0 0C${r1(W * 0.6)} ${r1(-L * 0.08)} ${r1(W * 1.02 * j())} ${r1(-L * 0.55)} ${r1(W * 0.8)} ${r1(-L * 0.9)}L${r1(W * 0.44)} ${r1(-L * 0.99)}L${r1(W * 0.22)} ${r1(-L * 0.9)}L0 ${r1(-L * j())}L${r1(-W * 0.22)} ${r1(-L * 0.9)}L${r1(-W * 0.44)} ${r1(-L * 0.99)}L${r1(-W * 0.8)} ${r1(-L * 0.9)}C${r1(-W * 1.02 * j())} ${r1(-L * 0.55)} ${r1(-W * 0.6)} ${r1(-L * 0.08)} 0 0Z`;
    case "ruffle":
      return `M0 0C${r1(W * 0.6)} ${r1(-L * 0.1)} ${r1(W * 1.02 * j())} ${r1(-L * 0.52)} ${r1(W * 0.82)} ${r1(-L * 0.84)}Q${r1(W * 0.52)} ${r1(-L * 1.04 * j())} ${r1(W * 0.24)} ${r1(-L * 0.93)}Q0 ${r1(-L * 1.06 * j())} ${r1(-W * 0.24)} ${r1(-L * 0.93)}Q${r1(-W * 0.52)} ${r1(-L * 1.04 * j())} ${r1(-W * 0.82)} ${r1(-L * 0.84)}C${r1(-W * 1.02 * j())} ${r1(-L * 0.52)} ${r1(-W * 0.6)} ${r1(-L * 0.1)} 0 0Z`;
    default:
      return `M0 0C${r1(W * 0.55)} ${r1(-L * 0.08)} ${r1(W * j())} ${r1(-L * 0.45)} ${r1(W * 0.72)} ${r1(-L * 0.82)}C${r1(W * 0.45)} ${r1(-L * 1.04 * j())} ${r1(-W * 0.45)} ${r1(-L * 1.04 * j())} ${r1(-W * 0.72)} ${r1(-L * 0.82)}C${r1(-W * j())} ${r1(-L * 0.45)} ${r1(-W * 0.55)} ${r1(-L * 0.08)} 0 0Z`;
  }
}

/** A cupped petal wrapped around the centre, for roses and ranunculus seen from above. */
function crescent(rIn: number, rOut: number, a0: number, a1: number) {
  const span = a1 - a0;
  const am = (a0 + a1) / 2;
  const fill = `M${pt(rIn, a0)}C${pt(rOut * 0.92, a0 + span * 0.08)} ${pt(rOut * 1.06, am - span * 0.28)} ${pt(rOut, am)}C${pt(rOut * 1.06, am + span * 0.28)} ${pt(rOut * 0.92, a1 - span * 0.08)} ${pt(rIn, a1)}Q${pt(rIn * 0.55, am)} ${pt(rIn, a0)}Z`;
  const edge = `M${pt(rOut * 0.97, a0 + span * 0.2)}C${pt(rOut * 1.05, am - span * 0.18)} ${pt(rOut * 1.05, am + span * 0.18)} ${pt(rOut * 0.97, a1 - span * 0.2)}`;
  return { fill, edge };
}

function ring(
  key: string,
  count: number,
  len: number,
  w: number,
  tip: Tip,
  offset: number,
  rng: Rng,
  fill: string,
  ink: string,
): ReactElement[] {
  return Array.from({ length: count }, (_, i) => {
    const a = offset + (i * 360) / count + (rng() - 0.5) * 12;
    const s = 0.9 + rng() * 0.2;
    return (
      <path
        key={`${key}${i}`}
        d={petal(len * s, w * (0.92 + rng() * 0.16), tip, rng)}
        transform={`rotate(${r1(a)})`}
        fill={fill}
        stroke={ink}
        strokeWidth={0.7}
        strokeOpacity={0.45}
        strokeLinejoin="round"
      />
    );
  });
}

/** Tiny dots packed on a golden-angle spiral: seeds, pollen, stamens. */
function seeds(key: string, count: number, radius: number, size: number, fill: string, opacity = 0.8): ReactElement[] {
  return Array.from({ length: count }, (_, i) => {
    const r = radius * Math.sqrt((i + 0.5) / count);
    const a = i * 2.39996;
    return <circle key={`${key}${i}`} cx={r1(r * Math.cos(a))} cy={r1(r * Math.sin(a))} r={size} fill={fill} opacity={opacity} />;
  });
}

function Defs({ uid, tone }: { uid: string; tone: Tone }) {
  return (
    <defs>
      <linearGradient id={`${uid}-p`} x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0" stopColor={tone.deep} />
        <stop offset="0.5" stopColor={tone.mid} />
        <stop offset="1" stopColor={tone.light} />
      </linearGradient>
      <radialGradient id={`${uid}-r`} cx="0" cy="0" r="52" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={mix(tone.deep, "#2B1B1E", 0.2)} />
        <stop offset="0.45" stopColor={tone.mid} />
        <stop offset="1" stopColor={tone.light} />
      </radialGradient>
      <radialGradient id={`${uid}-s`} cx="0.62" cy="0.66" r="0.62">
        <stop offset="0.45" stopColor={tone.deep} stopOpacity="0" />
        <stop offset="1" stopColor={tone.deep} stopOpacity="0.4" />
      </radialGradient>
    </defs>
  );
}

function rose(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const els: ReactElement[] = [<circle key="base" r={44} fill={tone.deep} />];
  let off = rng() * 360;
  const layers: [number, number, number, number][] = [
    [5, 26, 50, 112],
    [5, 17, 39, 118],
    [4, 9, 28, 128],
    [3, 3, 18, 150],
  ];
  layers.forEach(([count, rIn, rOut, span], li) => {
    for (let i = 0; i < count; i++) {
      const a0 = rad(off + (i * 360) / count + (rng() - 0.5) * 14);
      const a1 = a0 + rad(span * (0.9 + rng() * 0.2));
      const { fill, edge } = crescent(rIn, rOut * (0.94 + rng() * 0.1), a0, a1);
      els.push(<path key={`c${li}${i}`} d={fill} fill={`url(#${uid}-r)`} stroke={ink} strokeWidth={0.7} strokeOpacity={0.55} />);
      els.push(<path key={`e${li}${i}`} d={edge} fill="none" stroke={tone.light} strokeWidth={1.3} strokeOpacity={0.85} strokeLinecap="round" />);
    }
    off += 180 / count + 11;
  });
  els.push(<path key="swirl" d="M-4 2C-6-5 4-8 6-2C7 3 1 6-2 4" fill="none" stroke={ink} strokeWidth={1.3} strokeOpacity={0.7} strokeLinecap="round" />);
  return els;
}

function ranunculus(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const els: ReactElement[] = [<circle key="base" r={47} fill={tone.mid} />];
  const rings: [number, number][] = [[50, 6], [43, 6], [36, 6], [29, 5], [22, 5], [15, 4], [9, 3]];
  let off = rng() * 360;
  rings.forEach(([rOut, count], li) => {
    for (let i = 0; i < count; i++) {
      const a0 = rad(off + (i * 360) / count + (rng() - 0.5) * 10);
      const a1 = a0 + rad((360 / count) * (1.25 + rng() * 0.2));
      const { fill, edge } = crescent(Math.max(2, rOut - 12), rOut, a0, a1);
      els.push(<path key={`c${li}${i}`} d={fill} fill={`url(#${uid}-r)`} stroke={ink} strokeWidth={0.6} strokeOpacity={0.4} />);
      els.push(<path key={`e${li}${i}`} d={edge} fill="none" stroke={tone.light} strokeWidth={1} strokeOpacity={0.8} strokeLinecap="round" />);
    }
    off += 23;
  });
  els.push(<circle key="eye" r={3.4} fill="#7A9A45" />, <circle key="eye2" r={1.4} fill="#4E6B2A" />);
  return els;
}

function peony(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const off = rng() * 360;
  return [
    <circle key="base" r={46} fill={tone.mid} />,
    ...ring("a", 9, 50, 25, "ruffle", off, rng, p, ink),
    ...ring("b", 8, 40, 22, "ruffle", off + 22, rng, p, ink),
    ...ring("c", 8, 29, 17, "ruffle", off + 9, rng, p, ink),
    ...ring("d", 9, 16, 10, "ruffle", off + 31, rng, p, ink),
    ...seeds("st", 8, 8, 1.5, "#F2C94C", 0.9),
    <circle key="shade" r={48} fill={`url(#${uid}-s)`} />,
  ];
}

function sunflower(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const off = rng() * 360;
  return [
    ...ring("a", 18, 52, 12.5, "point", off, rng, p, ink),
    ...ring("b", 18, 45, 12, "point", off + 10, rng, p, ink),
    <circle key="c" r={20} fill={`url(#${uid}-c)`} stroke="#3F2412" strokeWidth={1.2} />,
    ...seeds("s", 64, 18, 1.1, "#A87438", 0.75),
    <defs key="d">
      <radialGradient id={`${uid}-c`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#7A4A22" />
        <stop offset="1" stopColor="#2E1A0C" />
      </radialGradient>
    </defs>,
  ];
}

function daisy(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  return [
    ...ring("a", 22, 41, 8, "round", rng() * 360, rng, `url(#${uid}-p)`, ink),
    <defs key="d">
      <radialGradient id={`${uid}-y`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FFE27A" />
        <stop offset="1" stopColor="#E09A18" />
      </radialGradient>
    </defs>,
    <circle key="c" r={10.5} fill={`url(#${uid}-y)`} />,
    ...seeds("s", 30, 9.5, 0.8, "#B87B0C", 0.7),
  ];
}

function cosmos(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const off = rng() * 360;
  const els = ring("a", 8, 46, 21.5, "notch", off, rng, `url(#${uid}-p)`, ink);
  for (let i = 0; i < 8; i++) {
    const a = off + i * 45;
    els.push(
      <path key={`v${i}`} d="M0-6L-6-38M0-6L0-41M0-6L6-38" transform={`rotate(${r1(a)})`} stroke={tone.deep} strokeWidth={0.7} strokeOpacity={0.25} fill="none" />,
    );
  }
  els.push(<circle key="c" r={8.5} fill="#F2B632" />, ...seeds("s", 14, 7.5, 0.9, "#C98A10", 0.8), ...seeds("t", 20, 10, 0.7, "#E7A21B", 0.9));
  return els;
}

function poppy(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const off = rng() * 360;
  const els: ReactElement[] = [];
  [0, 180, 90, 270].forEach((d, i) => {
    const big = i < 2;
    const a = off + d + (rng() - 0.5) * 16;
    els.push(
      <g key={`p${i}`} transform={`rotate(${r1(a)})`}>
        <path d={petal(big ? 48 : 43, big ? 44 : 39, "ruffle", rng)} fill={p} stroke={ink} strokeWidth={0.8} strokeOpacity={0.4} />
        <path d="M-10-8C-16-22-14-34-18-42M0-8C2-24-2-36 0-44M10-8C16-22 14-34 18-42" fill="none" stroke={tone.deep} strokeWidth={0.8} strokeOpacity={0.28} strokeLinecap="round" />
      </g>,
    );
  });
  els.push(<circle key="c" r={9.5} fill="#2B1D2A" />);
  for (let i = 0; i < 18; i++) {
    const a = rad(i * 20 + rng() * 8);
    els.push(
      <line key={`l${i}`} x1={r1(8 * Math.cos(a))} y1={r1(8 * Math.sin(a))} x2={r1(14.5 * Math.cos(a))} y2={r1(14.5 * Math.sin(a))} stroke="#3B2A3A" strokeWidth={0.9} />,
      <circle key={`t${i}`} cx={r1(15 * Math.cos(a))} cy={r1(15 * Math.sin(a))} r={1.1} fill="#5A4458" />,
    );
  }
  els.push(<circle key="pod" r={5} fill="#7F8F57" />, <path key="star" d="M-4 0H4M0-4V4M-3-3L3 3M-3 3L3-3" stroke="#56623A" strokeWidth={0.7} />);
  return els;
}

function lily(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const off = rng() * 360;
  const stripe = tone.light === "#FFFFFF" ? "#E4EBC2" : tone.light;
  const spotted = tone.light !== "#FFFFFF";
  const els: ReactElement[] = [];
  for (let i = 0; i < 6; i++) {
    const back = i % 2 === 0;
    const a = off + i * 60 + (rng() - 0.5) * 8;
    const len = back ? 54 : 49;
    els.push(
      <g key={`p${i}`} transform={`rotate(${r1(a)})`}>
        <path d={petal(len, back ? 16.5 : 15, "point", rng)} fill={p} stroke={ink} strokeWidth={0.7} strokeOpacity={0.45} />
        <path d={petal(len * 0.78, 4.2, "point", rng)} fill={stripe} opacity={0.75} />
        {spotted
          ? [0.3, 0.38, 0.46, 0.54].map((t, k) => (
              <circle key={k} cx={r1((k % 2 ? 1 : -1) * (2.5 + k))} cy={r1(-len * t)} r={1.2} fill={tone.deep} opacity={0.75} />
            ))
          : null}
      </g>,
    );
  }
  for (let i = 0; i < 6; i++) {
    const a = rad(off + 30 + i * 60 + (rng() - 0.5) * 14);
    const r = 26 + rng() * 5;
    const [x, y] = [r * Math.cos(a), r * Math.sin(a)];
    els.push(
      <line key={`s${i}`} x1={0} y1={0} x2={r1(x)} y2={r1(y)} stroke="#C9D6A3" strokeWidth={1.1} />,
      <ellipse key={`a${i}`} cx={r1(x)} cy={r1(y)} rx={3.2} ry={1.6} transform={`rotate(${r1((a * 180) / Math.PI + 90)} ${r1(x)} ${r1(y)})`} fill="#A94A1C" />,
    );
  }
  els.push(<circle key="pistil" cx={4} cy={-22} r={2.3} fill="#8AA35A" />, <line key="pl" x1={0} y1={0} x2={4} y2={-21} stroke="#B8C98E" strokeWidth={1.3} />);
  return els;
}

function hydrangea(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const rot = rng() * 6;
  const els: ReactElement[] = [<circle key="base" r={44} fill={tone.mid} opacity={0.55} />];
  const n = 34;
  for (let i = 0; i < n; i++) {
    const r = 39 * Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996 + rot;
    const [x, y] = [r * Math.cos(a), r * Math.sin(a)];
    const turn = rng() * 90;
    els.push(
      <g key={`f${i}`} transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(turn)})`}>
        {[0, 90, 180, 270].map((d) => (
          <path key={d} d={petal(9.5, 8, "round", rng)} transform={`rotate(${d})`} fill={p} stroke={ink} strokeWidth={0.5} strokeOpacity={0.35} />
        ))}
        <circle r={1.3} fill={tone.deep} />
      </g>,
    );
  }
  els.push(<circle key="shade" r={47} fill={`url(#${uid}-s)`} />);
  return els;
}

/** Tulips are drawn side-on: a cup, standing up along its stem. */
function tulip(uid: string, tone: Tone, rng: Rng) {
  const ink = inkOf(tone);
  const p = `url(#${uid}-p)`;
  const lean = (rng() - 0.5) * 3;
  return [
    <g key="t" transform={`translate(0 38) scale(1.35) skewX(${r1(lean)})`}>
      <path d="M-15-2C-22-28-10-56 0-62C10-56 22-28 15-2Z" fill={p} stroke={ink} strokeWidth={0.6} strokeOpacity={0.45} />
      <path d="M-15-2C-22-28-10-56 0-62C10-56 22-28 15-2Z" fill={tone.deep} opacity={0.22} />
      <path d="M-19 0C-28-24-18-52-5-57C-3-38-1-18 1 1Z" fill={p} stroke={ink} strokeWidth={0.6} strokeOpacity={0.45} />
      <path d="M19 0C28-24 18-52 5-57C3-38 1-18-1 1Z" fill={p} stroke={ink} strokeWidth={0.6} strokeOpacity={0.45} />
      <path d="M-12 1C-17-22-9-47 1-55C11-46 17-22 12 1C4 5-4 5-12 1Z" fill={p} stroke={ink} strokeWidth={0.6} strokeOpacity={0.5} />
      <path d="M1-50C3-36 3-18 1-2" fill="none" stroke={tone.light} strokeWidth={1.4} strokeOpacity={0.7} strokeLinecap="round" />
      <path d="M-9-38C-10-28-9-16-7-6" fill="none" stroke={tone.light} strokeWidth={1} strokeOpacity={0.5} strokeLinecap="round" />
    </g>,
  ];
}

const HEADS: Partial<Record<FlowerId, (uid: string, tone: Tone, rng: Rng) => ReactElement[]>> = {
  rose,
  peony,
  ranunculus,
  tulip,
  sunflower,
  lily,
  hydrangea,
  poppy,
  cosmos,
  daisy,
};

/** Point on a quadratic curve from 0,0 through (cx, -L/2) to (ex, -L). */
function along(t: number, cx: number, ex: number, L: number) {
  const u = 1 - t;
  return [2 * u * t * cx + t * t * ex, -(2 * u * t * (L / 2) + t * t * L)] as const;
}

function lavender(tone: Tone, L: number, rng: Rng) {
  const cx = (rng() - 0.5) * 18;
  const ex = cx * 0.6;
  const els: ReactElement[] = [
    <path key="s" d={`M0 0Q${r1(cx)} ${r1(-L / 2)} ${r1(ex)} ${r1(-L)}`} fill="none" stroke="#6F8B5A" strokeWidth={2} strokeLinecap="round" />,
  ];
  for (let t = 0.5, k = 0; t <= 1.001; t += 0.042, k++) {
    const [x, y] = along(t, cx, ex, L);
    const s = 1 - (t - 0.5) * 0.7;
    [-1, 1].forEach((side) => {
      els.push(
        <ellipse
          key={`b${k}${side}`}
          cx={r1(x + side * 3 * s)}
          cy={r1(y)}
          rx={r1(2.6 * s)}
          ry={r1(4.6 * s)}
          transform={`rotate(${side * 28} ${r1(x + side * 3 * s)} ${r1(y)})`}
          fill={k % 2 ? tone.deep : tone.mid}
        />,
      );
    });
  }
  const [tx, ty] = along(1, cx, ex, L);
  els.push(<ellipse key="tip" cx={r1(tx)} cy={r1(ty - 3)} rx={2.2} ry={4} fill={tone.mid} />);
  return els;
}

function gypsophila(tone: Tone, L: number, rng: Rng) {
  const els: ReactElement[] = [
    <path key="s" d={`M0 0L${r1((rng() - 0.5) * 6)} ${r1(-L * 0.55)}`} stroke="#7E9468" strokeWidth={1.3} fill="none" />,
  ];
  const branches = 6;
  for (let b = 0; b < branches; b++) {
    const fromY = -L * (0.4 + rng() * 0.15);
    const a = rad(-90 + (b - (branches - 1) / 2) * 24 + (rng() - 0.5) * 10);
    const len = L * (0.32 + rng() * 0.18);
    const ex = Math.cos(a) * len;
    const ey = fromY + Math.sin(a) * len;
    els.push(<path key={`b${b}`} d={`M0 ${r1(fromY)}Q${r1(ex * 0.4)} ${r1(ey + 8)} ${r1(ex)} ${r1(ey)}`} stroke="#7E9468" strokeWidth={0.8} fill="none" />);
    const blooms = 6 + Math.floor(rng() * 4);
    for (let i = 0; i < blooms; i++) {
      const bx = ex + (rng() - 0.5) * 16;
      const by = ey + (rng() - 0.5) * 14;
      const r = 2.2 + rng() * 1.2;
      els.push(
        <circle key={`f${b}-${i}`} cx={r1(bx)} cy={r1(by)} r={r1(r)} fill={tone.light} stroke={tone.deep} strokeWidth={0.5} strokeOpacity={0.7} />,
        <circle key={`d${b}-${i}`} cx={r1(bx)} cy={r1(by)} r={0.7} fill={tone.deep} opacity={0.6} />,
      );
    }
  }
  return els;
}

function eucalyptus(tone: Tone, L: number, rng: Rng, uid: string) {
  const cx = (rng() - 0.5) * 30;
  const ex = cx * 0.5;
  const els: ReactElement[] = [
    <path key="s" d={`M0 0Q${r1(cx)} ${r1(-L / 2)} ${r1(ex)} ${r1(-L)}`} fill="none" stroke="#6E7F66" strokeWidth={1.8} strokeLinecap="round" />,
  ];
  const pairs = Math.max(4, Math.round(L / 17));
  for (let i = 1; i <= pairs; i++) {
    const t = i / (pairs + 0.4);
    const [x, y] = along(t, cx, ex, L);
    const r = 11.5 - t * 6.5;
    [-1, 1].forEach((side) => {
      const lx = x + side * (r + 0.8);
      els.push(
        <ellipse key={`l${i}${side}`} cx={r1(lx)} cy={r1(y)} rx={r1(r)} ry={r1(r * 0.9)} fill={`url(#${uid}-p)`} stroke={tone.deep} strokeWidth={0.6} strokeOpacity={0.55} />,
        <line key={`v${i}${side}`} x1={r1(x)} y1={r1(y)} x2={r1(lx + side * r * 0.6)} y2={r1(y)} stroke={tone.deep} strokeWidth={0.5} strokeOpacity={0.35} />,
      );
    });
  }
  return els;
}

function fern(tone: Tone, L: number, rng: Rng, uid: string) {
  const cx = (rng() - 0.5) * 26;
  const ex = cx * 0.35;
  const els: ReactElement[] = [
    <path key="s" d={`M0 0Q${r1(cx)} ${r1(-L / 2)} ${r1(ex)} ${r1(-L)}`} fill="none" stroke={tone.deep} strokeWidth={1.6} strokeLinecap="round" />,
  ];
  for (let t = 0.14, k = 0; t <= 0.98; t += 0.055, k++) {
    const [x, y] = along(t, cx, ex, L);
    const s = 17 * Math.pow(1 - t, 0.8) + 3;
    [-1, 1].forEach((side) => {
      els.push(
        <path key={`f${k}${side}`} d={petal(s, s * 0.32, "point", rng)} transform={`translate(${r1(x)} ${r1(y)}) rotate(${side * 62})`} fill={`url(#${uid}-p)`} />,
      );
    });
  }
  return els;
}

const SPRAYS: Partial<Record<FlowerId, (tone: Tone, L: number, rng: Rng, uid: string) => ReactElement[]>> = {
  lavender,
  gypsophila,
  eucalyptus,
  fern,
};

/** A flower head centred on 0,0, about 100 units across. */
export function FlowerHead({ id, tone, uid, seed }: { id: FlowerId; tone: Tone; uid: string; seed: number }) {
  const rng = mulberry32(seed);
  const draw = HEADS[id];
  return (
    <g>
      <Defs uid={uid} tone={tone} />
      {draw ? draw(uid, tone, rng) : <g transform="translate(0 48)">{SPRAYS[id]?.(tone, 96, rng, uid)}</g>}
    </g>
  );
}

/** A filler or green growing up from 0,0 to length `length`. */
export function Spray({ id, tone, uid, seed, length }: { id: FlowerId; tone: Tone; uid: string; seed: number; length: number }) {
  const rng = mulberry32(seed);
  return (
    <g>
      <Defs uid={uid} tone={tone} />
      {SPRAYS[id]?.(tone, length, rng, uid)}
    </g>
  );
}
