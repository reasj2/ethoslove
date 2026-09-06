"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Decodes the audio once and draws peak bars; a marker shows the chosen start point. */
export function Waveform({ url, startAt, duration, onSeek, className }: { url: string; startAt: number; duration: number; onSeek: (s: number) => void; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [decodedDuration, setDecodedDuration] = useState(duration);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const buf = await fetch(url).then((r) => r.arrayBuffer());
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const audio = await ctx.decodeAudioData(buf);
        const channel = audio.getChannelData(0);
        const bars = 120;
        const block = Math.floor(channel.length / bars);
        const out: number[] = [];
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < block; j += 8) sum += Math.abs(channel[i * block + j]);
          out.push(sum / (block / 8));
        }
        const max = Math.max(...out) || 1;
        if (!cancelled) {
          setPeaks(out.map((v) => v / max));
          setDecodedDuration(audio.duration);
        }
        void ctx.close();
      } catch {
        if (!cancelled) setPeaks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const n = peaks.length || 1;
    const gap = 2;
    const bw = Math.max(1, (w - gap * (n - 1)) / n);
    const startX = (startAt / (decodedDuration || 1)) * w;
    peaks.forEach((p, i) => {
      const x = i * (bw + gap);
      const bh = Math.max(2, p * (h - 6));
      ctx.fillStyle = x < startX ? "rgba(26,22,20,0.22)" : "#E8604C";
      ctx.beginPath();
      ctx.roundRect(x, (h - bh) / 2, bw, bh, 1.5);
      ctx.fill();
    });
    ctx.fillStyle = "#1A1614";
    ctx.fillRect(startX - 1, 0, 2, h);
  }, [peaks, startAt, decodedDuration]);

  const seek = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onSeek(Math.round(frac * decodedDuration * 10) / 10);
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-14 w-full cursor-col-resize touch-none rounded-lg bg-paper-deep/60", className)}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
        seek(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && seek(e.clientX)}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={Math.round(decodedDuration)}
      aria-valuenow={Math.round(startAt)}
    />
  );
}
