export type ShapeKind = "heart" | "infinity" | "star";
export type Point = { x: number; y: number };

/** Parametric outlines in a roughly [-1, 1] box, y positive = down (canvas space). */
function shapePoint(kind: ShapeKind, t: number): Point {
  switch (kind) {
    case "heart": {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return { x: x / 17, y: -y / 17 };
    }
    case "infinity": {
      const d = 1 + Math.sin(t) * Math.sin(t);
      return { x: Math.cos(t) / d, y: (Math.sin(t) * Math.cos(t)) / d * 1.5 };
    }
    case "star": {
      // Perimeter of a 5-point star, t in [0, 2π) mapped to 10 edges.
      const verts: Point[] = [];
      for (let k = 0; k < 10; k++) {
        const r = k % 2 === 0 ? 1 : 0.46;
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      const u = ((t / (Math.PI * 2)) % 1) * 10;
      const i = Math.floor(u);
      const f = u - i;
      const a = verts[i % 10];
      const b = verts[(i + 1) % 10];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
}

/** Dense outline, evenly spaced by arc length. */
export function shapeOutline(kind: ShapeKind, count = 240): Point[] {
  const raw: Point[] = [];
  const N = 1200;
  for (let i = 0; i < N; i++) raw.push(shapePoint(kind, (i / N) * Math.PI * 2));
  const cum = [0];
  for (let i = 1; i <= N; i++) {
    const a = raw[i - 1];
    const b = raw[i % N];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[N];
  const out: Point[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total;
    while (j < N - 1 && cum[j + 1] < target) j++;
    const span = cum[j + 1] - cum[j] || 1;
    const f = (target - cum[j]) / span;
    const a = raw[j];
    const b = raw[(j + 1) % N];
    out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
  }
  return out;
}

/** N node positions evenly spaced along the outline, starting at t = 0. */
export function sampleShape(kind: ShapeKind, n: number): Point[] {
  return shapeOutline(kind, Math.max(1, n));
}

export type SkyLayout = { nodes: Point[]; outline: Point[]; center: Point; radius: number };

export function layoutSky(kind: ShapeKind, n: number, width: number, height: number): SkyLayout {
  const radius = Math.min(width * 0.42, height * 0.29);
  const center = { x: width / 2, y: height * 0.46 };
  const toPx = (p: Point) => ({ x: center.x + p.x * radius, y: center.y + p.y * radius });
  return {
    nodes: sampleShape(kind, n).map(toPx),
    outline: shapeOutline(kind, 260).map(toPx),
    center,
    radius,
  };
}
