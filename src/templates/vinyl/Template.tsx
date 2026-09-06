"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { parseRichText } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";
import type { TemplateProps } from "../types";
import { useGiftStrings } from "../_shared/i18n";
import { Typewriter } from "../_shared/Typewriter";
import { RichMessage } from "../_shared/RichMessage";
import { Countdown } from "../_shared/Countdown";
import { SurpriseReveal } from "../_shared/SurpriseReveal";
import { EndScreen } from "../_shared/EndScreen";
import type { VinylFields } from "./schema";

const SLEEVE: Record<VinylFields["sleeve"], { bg: string; ink: string; paper: string; muted: string }> = {
  black: { bg: "#151312", ink: "#f4efe7", paper: "#1f1c1a", muted: "rgba(244,239,231,0.55)" },
  cream: { bg: "#efe7d8", ink: "#1A1614", paper: "#fbf7ef", muted: "rgba(26,22,20,0.55)" },
  burgundy: { bg: "#4a1f26", ink: "#f4efe7", paper: "#5a2a32", muted: "rgba(244,239,231,0.6)" },
};

const S = {
  en: { drop: "Drop the needle", playing: "Now playing", crate: "From the crate", liner: "Liner notes", tap: "Tap a cover" },
  es: { drop: "Pon la aguja", playing: "Sonando", crate: "De la caja", liner: "Notas del libreto", tap: "Toca una portada" },
};

const RPM = 33.333;

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<VinylFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const sleeve = SLEEVE[data.fields.sleeve] ?? SLEEVE.cream;
  const [playing, setPlaying] = useState(false);
  const [cover, setCover] = useState(0);
  const [everStarted, setEverStarted] = useState(mode === "preview");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const album = data.fields.album || data.title || data.recipientName;
  const artist = data.fields.artist || data.senderName;

  // Real sync: the platter angle is derived from the audio clock, not a CSS animation.
  useEffect(() => {
    if (!data.music || mode === "preview") return;
    const audio = new Audio(data.music.url);
    audio.loop = true;
    audio.preload = "auto";
    if (data.music.startAt) audio.currentTime = data.music.startAt;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [data.music, mode]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let speed = 0; // deg per second, eases toward target so the platter spins up/down
    const target = () => (playing ? RPM * 6 : 0);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += (target() - speed) * Math.min(1, dt * (playing ? 2.2 : 1.4));
      const a = audioRef.current;
      angle.current = a && playing && !a.paused ? ((a.currentTime * RPM * 6) % 360) : (angle.current + speed * dt) % 360;
      if (discRef.current) discRef.current.style.transform = `rotate(${angle.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduce]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!everStarted) {
      setEverStarted(true);
      onEvent?.({ type: "started" });
    }
    if (playing) {
      a?.pause();
      setPlaying(false);
      return;
    }
    try {
      await a?.play();
    } catch {
      /* no audio or blocked: still spin */
    }
    setPlaying(true);
    onEvent?.({ type: "progress", pct: 30 });
  };

  useEffect(() => {
    const onVis = () => document.hidden && audioRef.current && (audioRef.current.pause(), setPlaying(false));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const photos = data.photos;
  const current = photos[cover];

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: sleeve.bg, color: sleeve.ink, fontFamily: "var(--gift-font-body)" }}>
      <div className="grain-overlay" />
      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-none">
        {/* Turntable */}
        <section className="relative flex flex-col items-center px-6 pt-[max(6cqh,36px)]">
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: sleeve.muted }}>{everStarted && playing ? s.playing : `${artist}`}</p>
          <h1 className="mt-2 max-w-sm text-center text-[clamp(1.5rem,7cqw,2rem)] leading-tight italic" style={{ fontFamily: "var(--gift-font-display)" }}>{album}</h1>

          <div className="relative mt-6 w-[min(80cqw,360px)]" style={{ aspectRatio: "1 / 1" }}>
            {/* plinth */}
            <div className="absolute inset-[-8%] rounded-[8%] bg-[linear-gradient(160deg,#3a2b22,#221913)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]" />
            <div className="absolute inset-[-8%] rounded-[8%] bg-[repeating-linear-gradient(95deg,rgba(255,255,255,0.03)_0_2px,transparent_2px_7px)]" />
            {/* platter */}
            <div className="absolute inset-[3%] rounded-full bg-[#2a2a2a] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05)]" />
            {/* record */}
            <div ref={discRef} className="absolute inset-[5%] rounded-full will-change-transform" style={{ background: "radial-gradient(circle, #0f0f0f 0%, #141414 30%, #0c0c0c 31%, #161616 100%)" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "repeating-radial-gradient(circle, rgba(255,255,255,0.055) 0 1px, transparent 1px 4px)" }} />
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(255,255,255,0.12), transparent 25%, transparent 50%, rgba(255,255,255,0.08) 60%, transparent 75%)" }} />
              {/* label */}
              <div className="absolute inset-[33%] flex flex-col items-center justify-center rounded-full text-center" style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}>
                <span className="text-[8px] tracking-[0.2em] uppercase opacity-80">{data.fields.side}</span>
                <span className="mt-0.5 line-clamp-2 px-3 text-[clamp(0.6rem,2.6cqw,0.8rem)] leading-tight italic" style={{ fontFamily: "var(--gift-font-display)" }}>{album}</span>
                <span className="mt-0.5 text-[7px] tracking-wider uppercase opacity-80">{artist}</span>
                <span className="absolute size-[9%] rounded-full bg-[#1a1a1a]" />
              </div>
            </div>
            {/* tonearm */}
            <motion.div
              className="absolute top-[4%] right-[6%] h-[52%] w-[6%] origin-top"
              animate={{ rotate: playing ? 24 : 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14 }}
              aria-hidden="true"
            >
              <div className="absolute top-0 left-1/2 size-[180%] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#c9c2b6] shadow-md" />
              <div className="absolute top-[10%] left-1/2 h-[90%] w-[40%] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#d9d2c6,#8f877b)]" />
              <div className="absolute bottom-[-6%] left-1/2 h-[14%] w-[140%] -translate-x-1/2 rounded-sm bg-[#2b2b2b]" />
            </motion.div>
            {/* play */}
            <button type="button" onClick={toggle} aria-label={playing ? "Pause" : s.drop} className="absolute bottom-[-4%] left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full shadow-lg" style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}>
              {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
            </button>
          </div>
          <AnimatePresence>
            {!everStarted ? (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-12 text-[12px] tracking-[0.22em] uppercase" style={{ color: sleeve.muted }}>
                {s.drop}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </section>

        {/* Crate */}
        <section className="mt-14">
          <p className="px-6 text-[11px] tracking-[0.3em] uppercase" style={{ color: sleeve.muted }}>{s.crate} · {s.tap}</p>
          <div className="scrollbar-none mt-3 flex snap-x gap-4 overflow-x-auto px-6 pb-6 pt-2" style={{ perspective: 900 }}>
            {photos.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => setCover(i)}
                animate={{ rotateY: i === cover ? 0 : -12, y: i === cover ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
                className={cn("relative aspect-square w-[42cqw] max-w-[190px] shrink-0 snap-center overflow-hidden rounded-[4px] shadow-[0_18px_30px_-16px_rgba(0,0,0,0.7)]", i === cover ? "ring-2" : "")}
                style={{ transformStyle: "preserve-3d", ["--tw-ring-color" as string]: "var(--gift-accent)" }}
              >
                <img src={p.url} alt={p.alt ?? ""} className="h-full w-full object-cover" draggable={false} loading="lazy" />
                <span className="absolute inset-y-0 left-0 w-[6%] bg-black/25" />
              </motion.button>
            ))}
          </div>
          {current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-6">
              <p className="text-[clamp(1.1rem,5cqw,1.35rem)] italic" style={{ fontFamily: "var(--gift-font-display)" }}>{current.caption || " "}</p>
              <p className="mt-1 text-[11px] tracking-[0.2em] uppercase" style={{ color: sleeve.muted }}>{String(cover + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p>
            </motion.div>
          ) : null}
        </section>

        {/* Liner notes */}
        <LinerNotes data={data} mode={mode} blocks={blocks} reduce={!!reduce} paper={sleeve.paper} muted={sleeve.muted} tone={data.fields.sleeve === "cream" ? "light" : "dark"} label={s.liner} onEvent={onEvent} onReact={onReact} onMakeOne={onMakeOne} />
      </div>
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function LinerNotes({ data, mode, blocks, reduce, paper, muted, tone, label, onEvent, onReact, onMakeOne }: { data: TemplateProps<VinylFields>["data"]; mode: TemplateProps["mode"]; blocks: ReturnType<typeof parseRichText>; reduce: boolean; paper: string; muted: string; tone: "light" | "dark"; label: string; onEvent?: TemplateProps["onEvent"]; onReact?: () => void; onMakeOne?: () => void }) {
  const t = useGiftStrings(data.locale);
  const instant = mode === "preview" || reduce || data.messageStyle === "fade";
  const [done, setDone] = useState(instant);
  const [inView, setInView] = useState(mode === "preview");
  const ref = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setInView(true), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
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
    <section ref={ref} className="mx-auto mt-10 flex w-[min(92cqw,560px)] flex-col gap-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="rounded-[6px] p-6 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.5)] sm:p-8" style={{ background: paper }}>
        <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: muted }}>{label}</p>
        <h2 className="mt-3 text-[clamp(1.4rem,6.5cqw,1.8rem)] italic" style={{ fontFamily: "var(--gift-font-display)" }}>{t("dear", { name: data.recipientName })}</h2>
        <div className="mt-3 font-mono text-[clamp(0.9rem,4cqw,1rem)] leading-relaxed [&_p+p]:mt-4 [&_strong]:font-bold [&_em]:text-[var(--gift-accent)]">
          {inView ? (instant ? <RichMessage blocks={blocks} stagger={mode === "preview" ? 0 : 0.5} onDone={() => setDone(true)} /> : <Typewriter blocks={blocks} active speed={40} onDone={() => setDone(true)} />) : null}
        </div>
        {done ? <p className="mt-5 text-right text-xl italic" style={{ fontFamily: "var(--gift-font-display)", color: "var(--gift-accent)" }}>— {data.senderName}</p> : null}
      </div>
      {done && data.countdown ? <div className="rounded-[6px] p-5" style={{ background: paper }}><Countdown countdown={data.countdown} locale={data.locale} tone={tone} /></div> : null}
      {done && data.surprise ? (
        <div className="rounded-[6px] p-5" style={{ background: paper }}>
          <p className="mb-3 text-center text-[11px] tracking-[0.25em] uppercase" style={{ color: muted }}>{t("ps")}</p>
          <SurpriseReveal surprise={data.surprise} locale={data.locale} tone={tone} onReveal={() => onEvent?.({ type: "surprise" })} />
        </div>
      ) : null}
      {done ? <div ref={endRef} className="pt-4"><EndScreen data={data} tone={tone} onReact={onReact} onMakeOne={onMakeOne} /></div> : null}
    </section>
  );
}
