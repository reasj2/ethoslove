"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { rememberRef } from "@/lib/attribution/ref";

/** Picks up `?ref=` on every navigation, including the client-side one from a gift's "make your own". */
export function RefCapture() {
  const pathname = usePathname();
  useEffect(() => {
    rememberRef(window.location.search);
  }, [pathname]);
  return null;
}
