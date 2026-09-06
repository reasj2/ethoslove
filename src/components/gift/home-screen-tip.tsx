"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Share, X } from "lucide-react";

const S = {
  en: { tip: "Keep this gift: tap Share, then “Add to Home Screen”." },
  es: { tip: "Guarda este regalo: toca Compartir y luego «Añadir a pantalla de inicio»." },
};

/** iOS Safari only — the one browser with no install prompt of its own. */
export function HomeScreenTip({ locale, onReplay }: { locale: "en" | "es"; onReplay?: () => void }) {
  const isIosSafari = typeof navigator !== "undefined" && /iPhone|iPad/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches;
  const [open, setOpen] = useState(isIosSafari);
  void onReplay;
  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="absolute inset-x-4 bottom-[max(3.5rem,env(safe-area-inset-bottom))] z-[75] flex items-center gap-3 rounded-2xl bg-white/95 p-3 text-sm text-ink shadow-lift backdrop-blur">
          <Share className="size-4 shrink-0 text-coral" />
          <span className="flex-1">{(S[locale] ?? S.en).tip}</span>
          <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
            <X className="size-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
