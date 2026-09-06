"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type ContainerSize = { width: number; height: number; isLandscape: boolean; ready: boolean };

/** Size of the template root. Templates size to their container, never the viewport. */
export function useContainerSize(ref: RefObject<HTMLElement | null>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0, isLandscape: false, ready: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) =>
        prev.width === width && prev.height === height && prev.ready
          ? prev
          : { width, height, isLandscape: width > height, ready: true },
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}
