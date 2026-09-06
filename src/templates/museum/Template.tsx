"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { GiftPhoto } from "@/lib/gift/schema";
import { parseRichText } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";
import type { TemplateProps } from "../types";
import { useGiftStrings } from "../_shared/i18n";
import { useGiftAudio } from "../_shared/hooks/use-gift-audio";
import { RichMessage } from "../_shared/RichMessage";
import { Typewriter } from "../_shared/Typewriter";
import { Countdown } from "../_shared/Countdown";
import { SurpriseReveal } from "../_shared/SurpriseReveal";
import { EndScreen } from "../_shared/EndScreen";
import { SoundToggle } from "../_shared/SoundToggle";
import type { MuseumFields } from "./schema";

const WALL: Record<MuseumFields["wall"], { wall: string; floor: string; ink: string; muted: string; plaque: string; tone: "light" | "dark" }> = {
  plaster: { wall: "#ece6dc", floor: "#b9a893", ink: "#1A1614", muted: "rgba(26,22,20,0.55)", plaque: "#f7f3ec", tone: "light" },
  charcoal: { wall: "#2b2a29", floor: "#151413", ink: "#f4efe7", muted: "rgba(244,239,231,0.55)", plaque: "#3a3836", tone: "dark" },
  sage: { wall: "#c9d1c3", floor: "#8e9a86", ink: "#1A1614", muted: "rgba(26,22,20,0.55)", plaque: "#eef1ea", tone: "light" },
};

const FRAME: Record<MuseumFields["frame"], string> = {
  oak: "linear-gradient(135deg,#a67c52,#7d5a3a 40%,#b98d63 70%,#6f4f33)",
  black: "linear-gradient(135deg,#2a2a2a,#111 45%,#333 75%,#0d0d0d)",
  gilt: "linear-gradient(135deg,#d9b25f,#a67c2c 40%,#f0d38a 65%,#9c7327)",
};

const S = {
  en: { enter: "Enter", room: "Room", wallText: "Wall text", swipe: "Swipe to walk", untitled: "Untitled" },
  es: { enter: "Entrar", room: "Sala", wallText: "Texto de pared", swipe: "Desliza para caminar", untitled: "Sin título" },
};

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<MuseumFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const palette = WALL[data.fields.wall] ?? WALL.plaster;
  const audio = useGiftAudio(data.music, mode !== "preview");
  const scroller = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(mode === "preview");
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const { scrollXProgress } = useScroll({ container: scroller });
  const lastPct = useRef(0);
  useEffect(() => scrollXProgress.on("change", (v) => {
    const pct = Math.round(v * 8) * 10;
    if (pct > lastPct.current) {
      lastPct.current = pct;
      onEvent?.({ type: "progress", pct: Math.min(80, pct) });
    }
  }), [scrollXProgress, onEvent]);

  const enter = () => {
    setStarted(true);
    void audio.start();
    onEvent?.({ type: "started" });
    scroller.current?.scrollBy({ left: scroller.current.clientWidth, behavior: "smooth" });
  };
  const next = () => scroller.current?.scrollBy({ left: scroller.current.clientWidth, behavior: "smooth" });
  const exhibition = data.fields.exhibition || data.title || data.recipientName;

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: palette.wall, color: palette.ink, fontFamily: "var(--gift-font-display)" }}>
      <div className="grain-overlay opacity-[0.05]" />
      {/* floor with perspective lines */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]" style={{ background: `linear-gradient(180deg, ${palette.floor}cc, ${palette.floor})` }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 44px)" }} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[22%] h-2 bg-black/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[8%] bg-[linear-gradient(180deg,rgba(0,0,0,0.12),transparent)]" />

      <div ref={scroller} className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain scrollbar-none">
        {/* Entrance placard */}
        <section className="relative flex h-full w-full shrink-0 snap-start flex-col items-center justify-center px-8 text-center">
          <div className="rounded-sm px-8 py-9 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.5)]" style={{ background: palette.plaque }}>
            <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: palette.muted }}>{data.senderName} · {data.recipientName}</p>
            <h1 className="mt-4 text-[clamp(2rem,10cqw,3rem)] leading-[1] italic">{exhibition}</h1>
            {data.fields.years ? <p className="mt-3 text-sm" style={{ color: palette.muted }}>{data.fields.years}</p> : null}
            <p className="mt-6 text-[11px] tracking-[0.25em] uppercase" style={{ color: palette.muted }}>{data.photos.length} {data.locale === "es" ? "obras" : "works"}</p>
          </div>
          <button type="button" onClick={enter} className="mt-10 flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-semibold shadow-lg" style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)", fontFamily: "var(--gift-font-body)" }}>
            {s.enter}
            <ChevronRight className="size-4" />
          </button>
        </section>

        {data.photos.map((photo, i) => (
          <Room key={photo.id} photo={photo} index={i} total={data.photos.length} years={data.fields.years} frame={FRAME[data.fields.frame] ?? FRAME.oak} palette={palette} scroller={scroller} reduce={!!reduce} roomLabel={s.room} untitled={s.untitled} onNext={next} />
        ))}

        {/* Wall text room */}
        <section className="relative flex h-full w-full shrink-0 snap-start items-start justify-center overflow-y-auto px-7 pt-[10cqh] pb-[max(2rem,env(safe-area-inset-bottom))] scrollbar-none">
          <WallText data={data} mode={mode} blocks={blocks} reduce={!!reduce} palette={palette} label={s.wallText} onEvent={onEvent} onReact={onReact} onMakeOne={onMakeOne} onReplay={mode === "preview" ? undefined : () => scroller.current?.scrollTo({ left: 0, behavior: "smooth" })} />
        </section>
      </div>

      {started ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(0.9rem,env(safe-area-inset-bottom))] text-center text-[10px] tracking-[0.3em] uppercase" style={{ color: palette.muted, fontFamily: "var(--gift-font-body)" }}>
          {s.swipe}
        </p>
      ) : null}
      <SoundToggle audio={audio} locale={data.locale} className={cn(palette.tone === "light" && "bg-black/15 text-current")} />
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function Room({ photo, index, total, years, frame, palette, scroller, reduce, roomLabel, untitled, onNext }: { photo: GiftPhoto; index: number; total: number; years?: string; frame: string; palette: (typeof WALL)["plaster"]; scroller: React.RefObject<HTMLDivElement | null>; reduce: boolean; roomLabel: string; untitled: string; onNext: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollXProgress } = useScroll({ container: scroller, target: ref, axis: "x", offset: ["start end", "end start"] });
  const x = useTransform(scrollXProgress, [0, 1], reduce ? [0, 0] : [50, -50]);
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], [0.94, 1, 0.94]);
  const portrait = photo.height > photo.width;
  return (
    <section ref={ref} className="relative flex h-full w-full shrink-0 snap-start flex-col items-center justify-center px-8 pb-[14%]">
      <span className="absolute top-[7%] left-6 text-[10px] tracking-[0.3em] uppercase" style={{ color: palette.muted, fontFamily: "var(--gift-font-body)" }}>
        {roomLabel} {index + 1} / {total}
      </span>
      <motion.figure style={{ x, scale }} className="flex flex-col items-center">
        <Spotlight />
        <div className="relative p-[10px] shadow-[0_40px_60px_-24px_rgba(0,0,0,0.55),0_2px_0_rgba(255,255,255,0.4)]" style={{ background: frame }}>
          <div className="bg-[#f6f2ea] p-[6%]">
            <img src={photo.url} alt={photo.alt ?? ""} className={cn("block object-cover", portrait ? "h-[min(48cqh,420px)] w-auto" : "w-[min(70cqw,360px)]")} draggable={false} loading="lazy" />
          </div>
        </div>
        <figcaption className="mt-5 w-[min(60cqw,260px)] rounded-[2px] px-4 py-3 text-left shadow-[0_6px_16px_-10px_rgba(0,0,0,0.4)]" style={{ background: palette.plaque, fontFamily: "var(--gift-font-body)" }}>
          <p className="text-[13px] font-semibold italic" style={{ fontFamily: "var(--gift-font-display)" }}>{photo.caption || untitled}</p>
          <p className="mt-0.5 text-[10px] tracking-[0.15em] uppercase" style={{ color: palette.muted }}>{years ?? ""}{years ? " · " : ""}{roomLabel} {index + 1}</p>
        </figcaption>
      </motion.figure>
      <button type="button" onClick={onNext} aria-label="Next room" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/10 text-current backdrop-blur hover:bg-black/20">
        <ChevronRight className="size-5" />
      </button>
    </section>
  );
}

function Spotlight() {
  return <div className="pointer-events-none absolute -top-[30%] left-1/2 h-[160%] w-[140%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,250,235,0.55),transparent_60%)]" aria-hidden="true" />;
}

function WallText({ data, mode, blocks, reduce, palette, label, onEvent, onReact, onMakeOne, onReplay }: { data: TemplateProps<MuseumFields>["data"]; mode: TemplateProps["mode"]; blocks: ReturnType<typeof parseRichText>; reduce: boolean; palette: (typeof WALL)["plaster"]; label: string; onEvent?: TemplateProps["onEvent"]; onReact?: () => void; onMakeOne?: () => void; onReplay?: () => void }) {
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
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setInView(true), { threshold: 0.3 });
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
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [onEvent]);
  return (
    <div ref={ref} className="flex w-[min(88cqw,520px)] flex-col gap-5">
      <div>
        <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: palette.muted, fontFamily: "var(--gift-font-body)" }}>{label}</p>
        <h2 className="mt-4 text-[clamp(1.6rem,7cqw,2.1rem)] italic">{t("dear", { name: data.recipientName })}</h2>
        <div className="mt-4 text-[clamp(1.05rem,4.6cqw,1.2rem)] leading-relaxed [&_p+p]:mt-4 [&_strong]:font-semibold [&_em]:text-[var(--gift-accent-deep)]" style={{ fontFamily: "var(--gift-font-body)" }}>
          {inView ? (instant ? <RichMessage blocks={blocks} stagger={mode === "preview" ? 0 : 0.55} onDone={() => setDone(true)} /> : <Typewriter blocks={blocks} active speed={34} onDone={() => setDone(true)} />) : null}
        </div>
        {done ? <p className="mt-5 text-right text-xl italic" style={{ color: "var(--gift-accent-deep)" }}>— {data.senderName}</p> : null}
      </div>
      {done && data.countdown ? <div className="rounded-sm p-5" style={{ background: palette.plaque }}><Countdown countdown={data.countdown} locale={data.locale} tone={palette.tone} /></div> : null}
      {done && data.surprise ? (
        <div className="rounded-sm p-5" style={{ background: palette.plaque }}>
          <p className="mb-3 text-center text-[11px] tracking-[0.25em] uppercase" style={{ color: palette.muted, fontFamily: "var(--gift-font-body)" }}>{t("ps")}</p>
          <SurpriseReveal surprise={data.surprise} locale={data.locale} tone={palette.tone} onReveal={() => onEvent?.({ type: "surprise" })} />
        </div>
      ) : null}
      {done ? <div ref={endRef} className="pt-2" style={{ fontFamily: "var(--gift-font-body)" }}><EndScreen data={data} tone={palette.tone} onReact={onReact} onMakeOne={onMakeOne} onReplay={onReplay} /></div> : null}
    </div>
  );
}
