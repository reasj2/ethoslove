"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

/**
 * Dark mode is scoped to the app shell. next-themes toggles a class on <html>; when the
 * shell unmounts (navigating to a marketing or gift page) we remove it so those pages
 * always render in their designed light palette.
 */
function ThemeCleanup() {
  useEffect(
    () => () => {
      const root = document.documentElement;
      root.classList.remove("dark", "light");
      root.style.colorScheme = "";
    },
    [],
  );
  return null;
}

export function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="ethos-theme"
      disableTransitionOnChange
    >
      <ThemeCleanup />
      {children}
    </ThemeProvider>
  );
}
