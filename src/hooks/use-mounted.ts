"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True after hydration, false during SSR — without a setState-in-effect. */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
