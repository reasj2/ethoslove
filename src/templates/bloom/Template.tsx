"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { parseRichText } from "@/lib/gift/rich-text";
import type { TemplateProps } from "../types";
import { useGiftStrings } from "../_shared/i18n";
import { useGiftAudio } from "../_shared/hooks/use-gift-audio";
import { hashString, mulberry32 } from "../_shared/random";
import { RichMessage } from "../_shared/RichMessage";
import { Typewriter } from "../_shared/Typewriter";
import { Countdown } from "../_shared/Countdown";
import { SurpriseReveal } from "../_shared/SurpriseReveal";
import { EndScreen } from "../_shared/EndScreen";
import { SoundToggle } from "../_shared/SoundToggle";
import { Flower, type BloomState } from "./Flower";
import type { BloomFields } from "./schema";

const SKY: Record<BloomFields["sky"], { bg: string; ink: string; tone: "light" | "dark" }> = {
  dawn: {
    bg: "linear-gradient(180deg,#f7e3d4 0%,#f1c9c0 45%,#d9a6a8 100%)",
    ink: "#3a2a2a",
    tone: "light",
  },
  dusk: {
    bg: "linear-gradient(180deg,#2b1f3a 0%,#4a2b4f 55%,#7a3f55 100%)",
    ink: "#f8eef0",
    tone: "dark",
  },
  paper: { bg: "linear-gradient(180deg,#faf7f2 0%,#f1ebe1 100%)", ink: "#1A1614", tone: "light" },
};

const S = {
  en: {
    hold: "Hold to bloom",
    holding: "Keep holding…",
    open: "It's open.",
    read: "Read the note",
    tap: "Tap to bloom",
    photos: "Tap a photo",
  },
  es: {
    hold: "Mantén pulsado para que florezca",
    holding: "Sigue así…",
    open: "Ya está abierta.",
    read: "Leer la nota",
    tap: "Toca para que florezca",
    photos: "Toca una foto",
  },
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<BloomFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const audio = useGiftAudio(data.music, mode !== "preview");
  const sky = SKY[data.fields.sky] ?? SKY.dawn;
  const [webgl] = useState(() => (typeof window === "undefined" ? true : hasWebGL()));
  const [bloomed, setBloomed] = useState(mode === "preview" || !webgl);
  const [holding, setHolding] = useState(false);
  const [started, setStarted] = useState(mode === "preview");
  const [note, setNote] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const state = useRef<BloomState>({
    progress: mode === "preview" ? 1 : 0,
    holding: false,
    bloomed: mode === "preview",
  });
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const color = data.fields.petalColor || data.accentColor;
  const seed = hashString(data.recipientName);
  const spots = useMemo(() => {
    const rng = mulberry32(seed);
    const n = Math.max(1, Math.min(8, data.photos.length));
    return data.photos.slice(0, 8).map((p, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        photo: p,
        x: 50 + side * (28 + rng() * 10),
        y: 24 + (i / Math.max(1, n - 1)) * 48,
        rot: (rng() - 0.5) * 16,
        delay: i * 0.12,
      };
    });
  }, [data.photos, seed]);

  const begin = () => {
    if (!started) {
      setStarted(true);
      void audio.start();
      onEvent?.({ type: "started" });
    }
  };
  const down = () => {
    begin();
    state.current.holding = true;
    setHolding(true);
    if (reduce) state.current.progress = 1;
  };
  const up = () => {
    state.current.holding = false;
    setHolding(false);
  };
  const onBloomed = () => {
    setBloomed(true);
    setHolding(false);
    onEvent?.({ type: "progress", pct: 45 });
  };

  useEffect(() => {
    const cancel = () => {
      state.current.holding = false;
      setHolding(false);
    };
    window.addEventListener("pointerup", cancel);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", cancel);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: sky.bg, color: sky.ink, fontFamily: "var(--gift-font-body)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(255,255,255,0.35),transparent)]" />
      {webgl ? (
        <div
          className="absolute inset-0 touch-none"
          onPointerDown={mode === "preview" ? undefined : down}
          onPointerUp={up}
          onPointerLeave={up}
        >
          <Flower
            kind={data.fields.flower}
            color={color}
            stateRef={state}
            pollen={data.fields.pollen}
            reduce={!!reduce}
            onBloomed={onBloomed}
            className="!absolute inset-0"
          />
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[8rem]" aria-hidden="true">
          🌸
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))] px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-60">
          {data.senderName} → {data.recipientName}
        </p>
        <p
          className="mt-2 text-[clamp(1.4rem,6.5cqw,1.9rem)] italic"
          style={{ fontFamily: "var(--gift-font-display)" }}
        >
          {data.title || data.recipientName}
        </p>
      </div>

      <AnimatePresence>
        {bloomed && !note
          ? spots.map((sp, i) => (
              <motion.button
                key={sp.photo.id}
                type="button"
                onClick={() => setLightbox(i)}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: [0, -6, 0], scale: 1, rotate: sp.rot }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  opacity: { delay: sp.delay, duration: 0.5 },
                  scale: { delay: sp.delay, type: "spring", stiffness: 200, damping: 16 },
                  y: {
                    delay: sp.delay + 0.5,
                    duration: 3 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="absolute z-20 w-[22cqw] max-w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white p-1 pb-3 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.45)]"
                style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
                data-bloom-photo={i}
              >
                <img
                  src={sp.photo.url}
                  alt={sp.photo.alt ?? ""}
                  className="aspect-square w-full object-cover"
                />
              </motion.button>
            ))
          : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+2rem))] z-30 flex flex-col items-center gap-3 px-8 text-center">
        {!bloomed ? (
          <>
            <motion.div
              animate={holding ? { scale: 1.06 } : { scale: [1, 1.03, 1] }}
              transition={holding ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity }}
              className="pointer-events-auto flex h-14 touch-none items-center gap-3 rounded-full px-7 text-[15px] font-semibold shadow-lg"
              style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}
              onPointerDown={down}
              onPointerUp={up}
              data-hold
            >
              <span className="relative grid size-6 place-items-center">
                <span className="absolute inset-0 rounded-full border-2 border-current opacity-40" />
                <span className="size-2.5 rounded-full bg-current" />
              </span>
              {holding ? s.holding : reduce ? s.tap : s.hold}
            </motion.div>
            <ProgressBar stateRef={state} active={started} />
          </>
        ) : !note ? (
          <>
            <p
              className="text-[clamp(1.1rem,5cqw,1.3rem)] italic"
              style={{ fontFamily: "var(--gift-font-display)" }}
            >
              {s.open}
            </p>
            {data.photos.length ? <p className="text-xs opacity-60">{s.photos}</p> : null}
            <button
              type="button"
              onClick={() => {
                setNote(true);
                onEvent?.({ type: "progress", pct: 70 });
              }}
              className="pointer-events-auto h-12 rounded-full px-7 text-[15px] font-semibold shadow-lg"
              style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}
            >
              {s.read}
            </button>
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {note ? (
          <motion.div
            key="note"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="absolute inset-0 z-40 scrollbar-none overflow-y-auto overscroll-contain bg-black/25 backdrop-blur-[2px]"
          >
            <Note
              data={data}
              mode={mode}
              blocks={blocks}
              reduce={!!reduce}
              onEvent={onEvent}
              onReact={onReact}
              onMakeOne={onMakeOne}
              onReplay={
                mode === "preview"
                  ? undefined
                  : () => {
                      state.current.progress = 0;
                      state.current.holding = false;
                      state.current.bloomed = false;
                      setBloomed(false);
                      setNote(false);
                      setStarted(true);
                    }
              }
              onClose={() => setNote(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox !== null && spots[lightbox] ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 grid place-items-center bg-black/85 p-5"
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="max-w-full text-center"
            >
              <img
                src={spots[lightbox].photo.url}
                alt={spots[lightbox].photo.alt ?? ""}
                className="max-h-[70cqh] rounded-md object-contain"
              />
              {spots[lightbox].photo.caption ? (
                <figcaption className="mt-3 text-sm text-white">
                  {spots[lightbox].photo.caption}
                </figcaption>
              ) : null}
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SoundToggle
        audio={audio}
        locale={data.locale}
        className={sky.tone === "light" ? "bg-black/10 text-current" : undefined}
      />
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

/** Polls the mutable bloom progress on a timer so React never re-renders per frame. */
function ProgressBar({ stateRef, active }: { stateRef: RefObject<BloomState>; active: boolean }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPct(Math.round((stateRef.current?.progress ?? 0) * 100)), 120);
    return () => clearInterval(id);
  }, [stateRef, active]);
  return (
    <div
      className="h-1 w-40 overflow-hidden rounded-full bg-black/10"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-150"
        style={{ width: `${pct}%`, background: "var(--gift-accent-deep)" }}
      />
    </div>
  );
}

function Note({
  data,
  mode,
  blocks,
  reduce,
  onEvent,
  onReact,
  onMakeOne,
  onReplay,
  onClose,
}: {
  data: TemplateProps<BloomFields>["data"];
  mode: TemplateProps["mode"];
  blocks: ReturnType<typeof parseRichText>;
  reduce: boolean;
  onEvent?: TemplateProps["onEvent"];
  onReact?: () => void;
  onMakeOne?: () => void;
  onReplay?: () => void;
  onClose: () => void;
}) {
  const t = useGiftStrings(data.locale);
  const instant = mode === "preview" || reduce || data.messageStyle === "fade";
  const [done, setDone] = useState(instant);
  const endRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !endedRef.current) {
          endedRef.current = true;
          onEvent?.({ type: "ended" });
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onEvent]);
  return (
    <div className="mx-auto flex w-[min(90cqw,520px)] flex-col gap-4 pt-[max(12cqh,64px)] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="self-center rounded-full bg-white/70 px-4 py-1.5 text-xs text-[#1A1614] backdrop-blur"
      >
        ↓
      </button>
      <div className="rounded-[18px] bg-[#fffdf8] px-7 py-8 text-[#1A1614] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
        <h2
          className="text-[clamp(1.5rem,6.5cqw,1.9rem)] italic"
          style={{ fontFamily: "var(--gift-font-display)" }}
        >
          {t("dear", { name: data.recipientName })}
        </h2>
        <div className="mt-4 text-[clamp(1rem,4.4cqw,1.1rem)] leading-relaxed [&_em]:text-[var(--gift-accent-deep)] [&_p+p]:mt-4 [&_strong]:font-semibold">
          {instant ? (
            <RichMessage
              blocks={blocks}
              stagger={mode === "preview" ? 0 : 0.5}
              onDone={() => setDone(true)}
            />
          ) : (
            <Typewriter blocks={blocks} active speed={38} onDone={() => setDone(true)} />
          )}
        </div>
        {done ? (
          <p
            className="mt-5 text-right text-xl italic"
            style={{ fontFamily: "var(--gift-font-display)", color: "var(--gift-accent-deep)" }}
          >
            — {data.senderName}
          </p>
        ) : null}
      </div>
      {done && data.countdown ? (
        <div className="rounded-[18px] bg-[#fffdf8] p-5 text-[#1A1614]">
          <Countdown countdown={data.countdown} locale={data.locale} tone="light" />
        </div>
      ) : null}
      {done && data.surprise ? (
        <div className="rounded-[18px] bg-[#fffdf8] p-5 text-[#1A1614]">
          <p className="mb-3 text-center text-[11px] tracking-[0.25em] uppercase opacity-50">
            {t("ps")}
          </p>
          <SurpriseReveal
            surprise={data.surprise}
            locale={data.locale}
            tone="light"
            onReveal={() => onEvent?.({ type: "surprise" })}
          />
        </div>
      ) : null}
      {done ? (
        <div ref={endRef} className="rounded-[18px] bg-[#fffdf8] p-4 text-[#1A1614]">
          <EndScreen
            data={data}
            tone="light"
            onReact={onReact}
            onMakeOne={onMakeOne}
            onReplay={onReplay}
          />
        </div>
      ) : null}
    </div>
  );
}
