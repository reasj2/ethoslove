"use client";

import { useEffect, useState } from "react";
import type { GiftData } from "@/lib/gift/schema";

type PreloadState = { progress: number; done: boolean };

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
    if (img.complete) resolve();
  });
}

function preloadAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "auto";
    const finish = () => resolve();
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.src = url;
    audio.load();
    // Audio can legitimately never reach canplaythrough on slow networks; cap the wait.
    setTimeout(finish, 4000);
  });
}

/**
 * Warms the browser cache for every asset a gift references and reports progress.
 * Never blocks forever: an overall timeout lets the template start regardless.
 */
export function usePreloadAssets(data: GiftData | null | undefined, enabled = true): PreloadState {
  const [state, setState] = useState<PreloadState>({ progress: 0, done: false });
  const key = data ? JSON.stringify([data.photos.map((p) => p.url), data.music?.url, data.video?.poster]) : "";

  useEffect(() => {
    if (!enabled || !data) return;
    let cancelled = false;
    const tasks: Promise<void>[] = [
      ...data.photos.map((p) => preloadImage(p.url)),
      ...(data.music ? [preloadAudio(data.music.url)] : []),
      ...(data.video?.poster ? [preloadImage(data.video.poster)] : []),
    ];
    if (tasks.length === 0) {
      queueMicrotask(() => !cancelled && setState({ progress: 1, done: true }));
      return () => {
        cancelled = true;
      };
    }
    let loaded = 0;
    tasks.forEach((task) =>
      task.then(() => {
        loaded += 1;
        if (!cancelled) setState({ progress: loaded / tasks.length, done: loaded === tasks.length });
      }),
    );
    const timeout = setTimeout(() => !cancelled && setState({ progress: 1, done: true }), 9000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
}
