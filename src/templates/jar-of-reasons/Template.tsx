"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hand } from "lucide-react";
import { parseRichText } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";
import type { TemplateProps } from "../types";
import { useGiftStrings } from "../_shared/i18n";
import { useGiftAudio } from "../_shared/hooks/use-gift-audio";
import { useShake } from "../_shared/hooks/use-shake";
import { hashString, mulberry32 } from "../_shared/random";
import { Typewriter } from "../_shared/Typewriter";
import { RichMessage } from "../_shared/RichMessage";
import { Countdown } from "../_shared/Countdown";
import { SurpriseReveal } from "../_shared/SurpriseReveal";
import { EndScreen } from "../_shared/EndScreen";
import { SoundToggle } from "../_shared/SoundToggle";
import type { JarFields } from "./schema";

const PAPER: Record<JarFields["paper"], string[]> = {
  white: ["#FBFAF6"],
  kraft: ["#D9C4A3", "#E3D2B6"],
  pastel: ["#FBE9E6", "#FFF3D6", "#E6F1EA", "#E7ECF7", "#F3E8F5"],
};

const S = {
  en: { label: "{n} reasons I love you", shake: "Shake your phone", tap: "or tap the jar", pull: "Pull another", enable: "Enable motion", left: "{n} left", empty: "The jar is empty.", read: "Read the letter", fold: "Tap to fold it back" },
  es: { label: "{n} razones por las que te quiero", shake: "Agita el teléfono", tap: "o toca el frasco", pull: "Sacar otra", enable: "Activar movimiento", left: "Quedan {n}", empty: "El frasco está vacío.", read: "Leer la carta", fold: "Toca para volver a doblarla" },
};

type Stage = "jar" | "letter";

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<JarFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const audio = useGiftAudio(data.music, mode !== "preview");
  const reasons = useMemo(() => (data.fields.reasons.length ? data.fields.reasons : ["…"]), [data.fields.reasons]);
  const total = reasons.length;
  const seed = hashString(data.recipientName + total);
  const order = useMemo(() => {
    const rng = mulberry32(seed);
    const idx = reasons.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [seed, reasons]);
  const [pulled, setPulled] = useState<number[]>(() => (mode === "preview" ? [order[0]] : []));
  const [open, setOpen] = useState<number | null>(() => (mode === "preview" ? order[0] : null));
  const [started, setStarted] = useState(mode === "preview");
  const [stage, setStage] = useState<Stage>("jar");
  const [wobble, setWobble] = useState(0);
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const remaining = total - pulled.length;
  const papers = PAPER[data.fields.paper] ?? PAPER.white;
  const label = data.fields.label || s.label.replace("{n}", String(total));

  const pull = useCallback(() => {
    if (open !== null || stage !== "jar") return;
    if (!started) {
      setStarted(true);
      void audio.start();
      onEvent?.({ type: "started" });
    }
    setWobble((w) => w + 1);
    setPulled((p) => {
      if (p.length >= total) return p;
      const next = order[p.length];
      setOpen(next);
      onEvent?.({ type: "progress", pct: Math.round(((p.length + 1) / total) * 70) });
      return [...p, next];
    });
  }, [open, stage, started, audio, onEvent, order, total]);

  const shake = useShake(pull, { enabled: stage === "jar" && open === null });

  const fold = () => setOpen(null);
  const replay = () => {
    setPulled([]);
    setOpen(null);
    setStage("jar");
  };

  const noteColor = (i: number) => papers[i % papers.length];
  const photo = open !== null && open < data.photos.length ? data.photos[open] : null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#ece4d6] text-ink select-none" style={{ fontFamily: "var(--gift-font-body)" }}>
      <div className="grain-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,#e6dccb,#d9cdb8)]" />
      <div className="absolute inset-x-0 top-[58%] h-px bg-black/10" />

      {/* Header */}
      <div className="absolute inset-x-0 top-[11%] z-20 px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-ink/50 uppercase">{data.senderName} → {data.recipientName}</p>
        <p className="mt-2 text-[clamp(1.4rem,6.5cqw,1.9rem)] leading-tight italic" style={{ fontFamily: "var(--gift-font-display)" }}>{label}</p>
      </div>

      {/* Jar */}
      <motion.div
        key={wobble}
        animate={reduce ? undefined : { rotate: [0, -3, 3, -2, 1, 0], y: [0, -6, 0] }}
        transition={{ duration: 0.6 }}
        className="absolute left-1/2 top-[30%] w-[min(58cqw,260px)] -translate-x-1/2 cursor-pointer"
        onClick={pull}
        role="button"
        aria-label={s.tap}
        style={{ aspectRatio: "0.78" }}
      >
        <div className="absolute inset-x-[14%] top-0 h-[10%] rounded-t-[14px] rounded-b-[6px] bg-[linear-gradient(180deg,#b9a68a,#8f7c5e)] shadow-[0_3px_6px_rgba(0,0,0,0.25)]" />
        <div className="absolute inset-x-0 top-[9%] bottom-0 rounded-[28px] rounded-t-[18px] border-2 border-black/10 bg-[linear-gradient(100deg,rgba(255,255,255,0.35),rgba(255,255,255,0.06)_35%,rgba(255,255,255,0.02)_60%,rgba(255,255,255,0.28))] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5),inset_0_-14px_24px_rgba(0,0,0,0.06),0_24px_40px_-20px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-[6%] bottom-[4%] top-[8%] overflow-hidden rounded-[22px]">
            {order.map((idx, k) => {
              const rng = mulberry32(seed + idx * 13);
              const still = !pulled.includes(idx);
              const row = Math.floor((k / total) * 100);
              return (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{ opacity: still ? 1 : 0, scale: still ? 1 : 0.4 }}
                  className="absolute rounded-[3px] border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                  style={{ width: `${22 + rng() * 14}%`, height: `${7 + rng() * 4}%`, left: `${rng() * 66}%`, bottom: `${Math.min(88, row * 0.85 + rng() * 6)}%`, rotate: `${(rng() - 0.5) * 60}deg`, background: noteColor(idx) }}
                />
              );
            })}
          </div>
          <div className="pointer-events-none absolute left-[12%] top-[10%] h-[70%] w-[6%] rounded-full bg-white/50 blur-[2px]" />
        </div>
        <div className="absolute inset-x-[18%] top-[47%] flex justify-center">
          <span className="rounded-md border border-[#c9b89a] bg-[#f6efe2] px-3 py-1 text-[11px] font-semibold tracking-wide text-ink/70 uppercase shadow-sm" style={{ fontFamily: "var(--gift-font-hand)", fontSize: "1rem", letterSpacing: 0 }}>
            {remaining}/{total}
          </span>
        </div>
      </motion.div>

      {/* Hint */}
      <AnimatePresence>
        {open === null && stage === "jar" ? (
          <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+4rem))] z-20 flex flex-col items-center gap-3 px-8 text-center">
            {remaining > 0 ? (
              <>
                <motion.p animate={reduce ? undefined : { rotate: [0, -6, 6, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.6 }} className="text-[13px] tracking-[0.22em] text-ink/70 uppercase">
                  {shake.supported && !shake.needsPermission ? s.shake : s.tap.replace(/^o |^or /, "")}
                </motion.p>
                {shake.supported && !shake.needsPermission ? <p className="text-xs text-ink/50">{s.tap}</p> : null}
                {shake.needsPermission ? (
                  <button type="button" onClick={() => void shake.requestPermission()} className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper">{s.enable}</button>
                ) : null}
                <button type="button" onClick={pull} className="flex h-11 items-center gap-2 rounded-full border border-ink/20 bg-white/70 px-5 text-sm font-medium backdrop-blur">
                  <Hand className="size-4" />
                  {s.pull}
                </button>
              </>
            ) : (
              <>
                <p className="text-lg italic" style={{ fontFamily: "var(--gift-font-display)" }}>{s.empty}</p>
                <button type="button" onClick={() => { setStage("letter"); onEvent?.({ type: "progress", pct: 80 }); }} className="h-12 rounded-full px-7 text-[15px] font-semibold shadow-lg" style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}>
                  {s.read}
                </button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Open note */}
      <AnimatePresence>
        {open !== null ? (
          <motion.div key={`note-${open}`} className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fold}>
            <motion.div
              initial={{ y: 120, scaleY: 0.25, rotate: -14, opacity: 0 }}
              animate={{ y: 0, scaleY: 1, rotate: -1.5, opacity: 1 }}
              exit={{ y: 90, scaleY: 0.3, rotate: 8, opacity: 0, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="relative w-[min(86cqw,420px)] rounded-[4px] p-6 pt-8 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
              style={{ background: noteColor(open), backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(0,0,0,0.06) 27px 28px)" }}
            >
              <span className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-3deg] bg-[rgba(234,216,172,0.85)]" />
              <p className="text-[11px] tracking-[0.25em] text-ink/45 uppercase">#{pulled.indexOf(open) + 1}</p>
              {photo ? (
                <div className="mx-auto mt-3 w-[70%] rotate-2 bg-white p-2 pb-5 shadow-md">
                  <img src={photo.url} alt={photo.alt ?? ""} className="aspect-square w-full object-cover" />
                </div>
              ) : null}
              <p className="mt-4 text-[clamp(1.35rem,6cqw,1.7rem)] leading-snug" style={{ fontFamily: "var(--gift-font-hand)" }}>
                {reasons[open]}
              </p>
              <p className="mt-6 text-xs text-ink/45">{s.fold}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Letter */}
      <AnimatePresence>
        {stage === "letter" ? (
          <motion.div key="letter" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 90, damping: 20 }} className="absolute inset-0 z-40 overflow-y-auto bg-[#fbfaf6] scrollbar-none">
            <LetterBody data={data} mode={mode} blocks={blocks} reduce={!!reduce} onEvent={onEvent} onReact={onReact} onMakeOne={onMakeOne} onReplay={mode === "preview" ? undefined : replay} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SoundToggle audio={audio} locale={data.locale} className="bg-black/15 text-ink" />
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function LetterBody({ data, mode, blocks, reduce, onEvent, onReact, onMakeOne, onReplay }: { data: TemplateProps<JarFields>["data"]; mode: TemplateProps["mode"]; blocks: ReturnType<typeof parseRichText>; reduce: boolean; onEvent?: TemplateProps["onEvent"]; onReact?: () => void; onMakeOne?: () => void; onReplay?: () => void }) {
  const t = useGiftStrings(data.locale);
  const instant = mode === "preview" || reduce || data.messageStyle === "fade";
  const [done, setDone] = useState(instant);
  const endRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !endedRef.current) {
        endedRef.current = true;
        onEvent?.({ type: "ended" });
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [onEvent]);
  return (
    <div className="mx-auto flex w-[min(88cqw,560px)] flex-col gap-6 pt-[max(8cqh,48px)] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <div>
        <h2 className="text-[clamp(1.7rem,7cqw,2.2rem)]" style={{ fontFamily: "var(--gift-font-hand)" }}>{t("dear", { name: data.recipientName })}</h2>
        <div className={cn("mt-4 text-[clamp(1.25rem,5.2cqw,1.5rem)] leading-[1.45] text-ink [&_p+p]:mt-4 [&_strong]:font-bold [&_em]:text-[var(--gift-accent)]")} style={{ fontFamily: "var(--gift-font-hand)" }}>
          {instant ? <RichMessage blocks={blocks} stagger={mode === "preview" ? 0 : 0.5} onDone={() => setDone(true)} /> : <Typewriter blocks={blocks} active speed={30} onDone={() => setDone(true)} />}
        </div>
        {done ? <p className="mt-6 text-right text-[2rem]" style={{ fontFamily: "var(--gift-font-hand)", color: "var(--gift-accent)" }}>{data.senderName}</p> : null}
      </div>
      {done && data.countdown ? <div className="rounded-2xl border border-black/10 bg-white p-5"><Countdown countdown={data.countdown} locale={data.locale} tone="light" /></div> : null}
      {done && data.surprise ? (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-center text-[11px] tracking-[0.25em] text-ink/50 uppercase">{t("ps")}</p>
          <SurpriseReveal surprise={data.surprise} locale={data.locale} tone="light" onReveal={() => onEvent?.({ type: "surprise" })} />
        </div>
      ) : null}
      {done ? <div ref={endRef} className="pt-4 pb-6"><EndScreen data={data} tone="light" onReact={onReact} onMakeOne={onMakeOne} onReplay={onReplay} /></div> : null}
    </div>
  );
}
