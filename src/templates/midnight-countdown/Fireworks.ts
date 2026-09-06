type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Rocket = { x: number; y: number; vy: number; vx: number; target: number; color: string; trail: { x: number; y: number }[] };

/** Rockets rise from the bottom, burst into gravity-bound sparks with fading trails. */
export class Fireworks {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private sparks: Spark[] = [];
  private rockets: Rocket[] = [];
  private raf = 0;
  private running = false;
  private last = 0;
  private nextLaunch = 0;
  private time = 0;
  colors: string[] = ["#F2C879", "#FFF8F4", "#E8604C", "#F4C7C3", "#9ad0ff"];
  intensity = 1;
  reduced = false;
  /** 0..1, fades the whole show in/out. */
  alpha = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  launch(x = 0.2 + Math.random() * 0.6) {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.rockets.push({ x: x * this.w, y: this.h + 10, vy: -(this.h * 0.9 + Math.random() * this.h * 0.35), vx: (Math.random() - 0.5) * 60, target: this.h * (0.18 + Math.random() * 0.3), color, trail: [] });
  }

  private burst(x: number, y: number, color: string) {
    const n = this.reduced ? 40 : 90 + Math.floor(Math.random() * 60);
    const ring = Math.random() < 0.35;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
      const speed = ring ? 180 + Math.random() * 30 : 60 + Math.random() * 220;
      const max = 1.2 + Math.random() * 1.2;
      this.sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: max, max, color: Math.random() < 0.15 ? "#ffffff" : color, size: 1.5 + Math.random() * 1.5 });
    }
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.step(dt);
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number) {
    const { ctx, w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (this.intensity > 0 && this.time > this.nextLaunch) {
      this.launch();
      if (Math.random() < 0.3) this.launch();
      this.nextLaunch = this.time + (this.reduced ? 1.6 : 0.35 + Math.random() * 0.9) / this.intensity;
    }
    ctx.globalCompositeOperation = "lighter";
    for (const r of this.rockets) {
      r.vy += 700 * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.6 * this.alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      r.trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
    this.rockets = this.rockets.filter((r) => {
      if (r.vy >= -40 || r.y <= r.target) {
        this.burst(r.x, r.y, r.color);
        return false;
      }
      return true;
    });
    this.sparks = this.sparks.filter((s) => s.life > 0);
    for (const s of this.sparks) {
      s.life -= dt;
      s.vy += 160 * dt;
      s.vx *= 0.985;
      s.vy *= 0.985;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const a = Math.max(0, s.life / s.max);
      ctx.globalAlpha = a * this.alpha * (s.life < 0.5 && Math.random() < 0.3 ? 0.3 : 1);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.6 + a * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
