"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State = "idle" | "listening" | "denied" | "unsupported";

/**
 * Listens on the microphone and reports sustained loud, low-frequency noise — what
 * blowing into a phone sounds like. Returns a 0..1 "breath" level for visual feedback.
 */
export function useBlowDetector({ enabled, onBlow, threshold = 0.16, holdMs = 450 }: { enabled: boolean; onBlow: () => void; threshold?: number; holdMs?: number }) {
  const [state, setState] = useState<State>(() => (typeof navigator !== "undefined" && "mediaDevices" in navigator && Boolean(navigator.mediaDevices) ? "idle" : "unsupported"));
  const [level, setLevel] = useState(0);
  const ctx = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const onBlowRef = useRef(onBlow);
  useEffect(() => {
    onBlowRef.current = onBlow;
  }, [onBlow]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void ctx.current?.close();
    ctx.current = null;
  }, []);

  const start = useCallback(async () => {
    if (state === "unsupported" || state === "listening") return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const src = ac.createMediaStreamSource(s);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      stream.current = s;
      ctx.current = ac;
      setState("listening");
      let above = 0;
      let last = performance.now();
      const tick = (now: number) => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        setLevel((prev) => prev * 0.6 + Math.min(1, rms / 0.35) * 0.4);
        const dt = now - last;
        last = now;
        above = rms > threshold ? above + dt : 0;
        if (above >= holdMs) {
          above = 0;
          onBlowRef.current();
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      setState("denied");
    }
  }, [state, threshold, holdMs]);

  useEffect(() => {
    if (!enabled) stop();
    return stop;
  }, [enabled, stop]);

  return { state, level, start, stop };
}
