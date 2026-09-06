"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";

type Options = { maxTiltDeg?: number; stiffness?: number; damping?: number };

export type GyroParallax = {
  /** -1..1, sprung. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** iOS 13+ needs a gesture-driven permission request. */
  needsPermission: boolean;
  requestPermission: () => Promise<boolean>;
  source: "gyro" | "pointer" | "none";
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * Device-orientation parallax with a pointer fallback on desktop.
 * Values are relative to the orientation at first reading so any resting angle is "center".
 */
export function useGyroParallax(
  containerRef: RefObject<HTMLElement | null>,
  { maxTiltDeg = 18, stiffness = 60, damping = 18 }: Options = {},
): GyroParallax {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping, mass: 0.6 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.6 });
  const [source, setSource] = useState<GyroParallax["source"]>("none");
  const [needsPermission, setNeedsPermission] = useState(() => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return false;
    return typeof (DeviceOrientationEvent as DeviceOrientationEventWithPermission).requestPermission === "function";
  });
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);

  const attachGyro = useCallback(() => {
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!baseline.current) baseline.current = { beta: e.beta, gamma: e.gamma };
      const dx = Math.max(-1, Math.min(1, (e.gamma - baseline.current.gamma) / maxTiltDeg));
      const dy = Math.max(-1, Math.min(1, (e.beta - baseline.current.beta) / maxTiltDeg));
      rawX.set(dx);
      rawY.set(dy);
      setSource((s) => (s === "gyro" ? s : "gyro"));
    };
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [maxTiltDeg, rawX, rawY]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
      setSource((s) => (s === "gyro" ? s : "pointer"));
    };
    el.addEventListener("pointermove", onPointer, { passive: true });

    const DOE = (typeof DeviceOrientationEvent !== "undefined"
      ? DeviceOrientationEvent
      : undefined) as DeviceOrientationEventWithPermission | undefined;
    let detach: (() => void) | undefined;
    if (DOE && typeof DOE.requestPermission !== "function") {
      detach = attachGyro();
    }
    return () => {
      el.removeEventListener("pointermove", onPointer);
      detach?.();
    };
  }, [attachGyro, containerRef, rawX, rawY]);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DOE.requestPermission !== "function") return true;
    try {
      const result = await DOE.requestPermission();
      if (result === "granted") {
        attachGyro();
        setNeedsPermission(false);
        return true;
      }
    } catch {
      /* denied */
    }
    setNeedsPermission(false);
    return false;
  }, [attachGyro]);

  return { x, y, needsPermission, requestPermission, source };
}
