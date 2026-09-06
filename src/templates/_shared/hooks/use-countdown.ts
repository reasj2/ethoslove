"use client";

import { useEffect, useState } from "react";

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; done: boolean; totalMs: number };

function compute(target: number): CountdownParts {
  const totalMs = Math.max(0, target - Date.now());
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: totalMs === 0,
    totalMs,
  };
}

export function useCountdown(targetAt: string | undefined): CountdownParts {
  const target = targetAt ? new Date(targetAt).getTime() : 0;
  const [parts, setParts] = useState<CountdownParts>(() => compute(target));

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setParts(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}
