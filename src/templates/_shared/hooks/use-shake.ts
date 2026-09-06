"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * Fires `onShake` when the device is shaken. Returns whether motion is available and a
 * gesture-safe permission requester (iOS).
 */
export function useShake(onShake: () => void, { threshold = 18, enabled = true } = {}) {
  const hasApi = typeof window !== "undefined" && typeof DeviceMotionEvent !== "undefined";
  const gated = hasApi && typeof (DeviceMotionEvent as DeviceMotionEventWithPermission).requestPermission === "function";
  const [supported, setSupported] = useState(hasApi);
  const [needsPermission, setNeedsPermission] = useState(gated);
  const lastRef = useRef({ x: 0, y: 0, z: 0, t: 0 });
  const callbackRef = useRef(onShake);
  useEffect(() => {
    callbackRef.current = onShake;
  }, [onShake]);

  const attach = useCallback(() => {
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const now = Date.now();
      const last = lastRef.current;
      if (now - last.t < 90) return;
      const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
      lastRef.current = { x: a.x, y: a.y, z: a.z, t: now };
      if (last.t !== 0 && delta > threshold) callbackRef.current();
    };
    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [threshold]);

  useEffect(() => {
    if (!enabled || !hasApi || gated) return;
    return attach();
  }, [attach, enabled, hasApi, gated]);

  const requestPermission = useCallback(async () => {
    const DME = DeviceMotionEvent as DeviceMotionEventWithPermission;
    if (typeof DME.requestPermission !== "function") return true;
    try {
      if ((await DME.requestPermission()) === "granted") {
        attach();
        setNeedsPermission(false);
        return true;
      }
    } catch {
      /* denied */
    }
    setNeedsPermission(false);
    setSupported(false);
    return false;
  }, [attach]);

  return { supported, needsPermission, requestPermission };
}
