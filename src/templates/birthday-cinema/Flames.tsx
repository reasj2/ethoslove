"use client";

import { useEffect, useRef } from "react";

export type FlameState = "lit" | "out";

/**
 * Canvas candle flames. Each flame is a stack of soft radial blobs that sway on a noise
 * curve; `wind` (0..1) leans and shrinks them; going out spawns smoke.
 */
export function Flames({ positions, states, wind, reduced }: { positions: { x: number; y: number }[]; states: FlameState[]; wind: number; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const smoke = useRef<{ x: number; y: number; vy: number; life: number; r: number }[]>([]);
  const prevStates = useRef<FlameState[]>([]);
  const windRef = useRef(wind);
  useEffect(() => {
    windRef.current = wind;
  }, [wind]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const wind = windRef.current;
      positions.forEach((p, i) => {
        const x = p.x * w;
        const y = p.y * h;
        if (states[i] === "out") {
          if (prevStates.current[i] === "lit") for (let k = 0; k < 6; k++) smoke.current.push({ x: x + (Math.random() - 0.5) * 6, y, vy: -20 - Math.random() * 25, life: 1.4 + Math.random(), r: 3 + Math.random() * 3 });
          return;
        }
        const sway = reduced ? 0 : Math.sin(t * 7 + i * 1.7) * 2.2 + Math.sin(t * 13 + i) * 1.1;
        const lean = wind * 18 + sway;
        const size = (1 - wind * 0.55) * (reduced ? 1 : 0.9 + 0.1 * Math.sin(t * 9 + i));
        const fh = 26 * size;
        const fw = 9 * size;
        ctx.save();
        ctx.translate(x, y);
        ctx.transform(1, 0, lean / 40, 1, 0, 0);
        const glow = ctx.createRadialGradient(0, -fh * 0.4, 0, 0, -fh * 0.4, fh * 2.2);
        glow.addColorStop(0, "rgba(255,170,60,0.35)");
        glow.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -fh * 0.4, fh * 2.2, 0, Math.PI * 2);
        ctx.fill();
        const outer = ctx.createRadialGradient(0, -fh * 0.45, 0, 0, -fh * 0.45, fh);
        outer.addColorStop(0, "rgba(255,230,150,1)");
        outer.addColorStop(0.45, "rgba(255,150,40,0.95)");
        outer.addColorStop(1, "rgba(255,80,20,0)");
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-fw, -fh * 0.3, -fw * 0.9, -fh * 0.8, 0, -fh);
        ctx.bezierCurveTo(fw * 0.9, -fh * 0.8, fw, -fh * 0.3, 0, 0);
        ctx.fill();
        ctx.fillStyle = "rgba(120,180,255,0.7)";
        ctx.beginPath();
        ctx.ellipse(0, -fh * 0.16, fw * 0.32, fh * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      prevStates.current = [...states];
      smoke.current = smoke.current.filter((s) => s.life > 0);
      for (const s of smoke.current) {
        s.life -= dt;
        s.y += s.vy * dt;
        s.x += Math.sin(s.life * 5) * 12 * dt;
        s.r += 8 * dt;
        ctx.globalAlpha = Math.max(0, s.life * 0.22);
        ctx.fillStyle = "#9a948c";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [positions, states, reduced]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
