"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
import type { FrontPageFields } from "./schema";

const INK: Record<FrontPageFields["ink"], string> = { black: "#151311", navy: "#1c2a4a", sepia: "#4a3626" };

const S = {
  en: { daily: "The Daily", extra: "Extra! Extra!", tap: "Tap to read", weather: "Weather", classifieds: "Classifieds", horoscope: "Horoscope", continued: "Continued on the back page", edition: "Late edition", vol: "Vol. XXX · No. 1", staff: "Staff report", readOn: "Read on", weatherDefault: "Sunny, with a 100% chance of cake.", backPage: "Back page" },
  es: { daily: "El Diario de", extra: "¡Extra, extra!", tap: "Toca para leer", weather: "El tiempo", classifieds: "Clasificados", horoscope: "Horóscopo", continued: "Continúa en la contraportada", edition: "Edición de tarde", vol: "Vol. XXX · N.º 1", staff: "Redacción", readOn: "Seguir leyendo", weatherDefault: "Soleado, con un 100 % de probabilidad de tarta.", backPage: "Contraportada" },
};

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<FrontPageFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const audio = useGiftAudio(data.music, mode !== "preview");
  const [landed, setLanded] = useState(mode === "preview");
  const [started, setStarted] = useState(mode === "preview");
  const ink = INK[data.fields.ink] ?? INK.black;
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const paperName = data.fields.paperName || `${s.daily} ${data.recipientName}`;
  const headline = data.fields.headline || data.title || data.recipientName;
  const [lead, ...rest] = data.photos;
  const date = useMemo(() => new Intl.DateTimeFormat(data.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), [data.locale]);

  const start = () => {
    setStarted(true);
    void audio.start();
    onEvent?.({ type: "started" });
  };

  useEffect(() => {
    if (!landed) {
      const id = setTimeout(() => setLanded(true), reduce ? 100 : 1300);
      return () => clearTimeout(id);
    }
  }, [landed, reduce]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#8d7f6b] select-none" style={{ color: ink, fontFamily: "var(--gift-font-body)" }}>
      {/* doormat */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.08)_0_3px,transparent_3px_9px),repeating-linear-gradient(0deg,rgba(0,0,0,0.06)_0_2px,transparent_2px_7px)]" />
      <div className="grain-overlay opacity-[0.12]" />

      <motion.div
        initial={mode === "preview" ? false : { y: "-120%", rotate: -14, scale: 0.9 }}
        animate={{ y: 0, rotate: started ? 0 : -1.5, scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 14, mass: 1.1 }}
        className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-none"
        style={{ pointerEvents: started ? "auto" : "none" }}
      >
        <article className="mx-auto min-h-full w-[min(96cqw,720px)] bg-[#f5efe2] px-[5cqw] pt-[max(4cqh,22px)] pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] sm:px-8" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.25 0 0 0 0 0.2 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}>
          {/* Masthead */}
          <header className="text-center">
            <div className="flex items-center justify-between border-y text-[9px] tracking-[0.18em] uppercase" style={{ borderColor: ink }}>
              <span className="py-1">{s.vol}</span>
              <span className="py-1">{s.edition}</span>
              <span className="py-1">{data.fields.price || "€0.00"}</span>
            </div>
            <h1 className="mt-3 text-[clamp(2.2rem,11cqw,3.6rem)] leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0', fontWeight: 900 }}>
              {paperName}
            </h1>
            <div className="mt-2 border-y-[3px] py-1 text-[10px] tracking-[0.22em] uppercase" style={{ borderColor: ink }}>
              {date}
            </div>
          </header>

          {/* Headline */}
          <section className="mt-5 text-center">
            <p className="inline-block -rotate-2 border-2 px-2 py-0.5 text-[10px] font-bold tracking-[0.25em] uppercase" style={{ borderColor: "var(--gift-accent)", color: "var(--gift-accent)" }}>{s.extra}</p>
            <h2 className="mt-3 text-[clamp(1.9rem,9cqw,3rem)] leading-[1] font-bold uppercase" style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"opsz" 144, "SOFT" 20, "WONK" 0', fontWeight: 800 }}>
              {headline}
            </h2>
            {data.fields.subhead ? <p className="mt-3 text-[clamp(0.95rem,4cqw,1.1rem)] italic" style={{ fontFamily: "var(--font-display)" }}>{data.fields.subhead}</p> : null}
          </section>

          {/* Lead photo */}
          {lead ? (
            <figure className="mt-5 border-y py-3" style={{ borderColor: ink }}>
              <img src={lead.url} alt={lead.alt ?? ""} className="w-full object-cover grayscale-[0.15] contrast-[1.05]" style={{ aspectRatio: "3 / 2" }} />
              {lead.caption ? <figcaption className="mt-2 text-[11px] leading-snug"><strong>▲</strong> {lead.caption}</figcaption> : null}
            </figure>
          ) : null}

          {/* Body: columns + sidebar */}
          <div className="mt-5 grid gap-6 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-[0.2em] uppercase">{s.staff}</p>
              <div className="text-[clamp(0.9rem,3.9cqw,1rem)] leading-[1.5] [column-gap:1.4rem] sm:[column-count:2] [&_p]:mb-3 [&_p]:text-justify [&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:mr-2 [&_p:first-of-type]:first-letter:text-[3.2em] [&_p:first-of-type]:first-letter:leading-[0.8] [&_p:first-of-type]:first-letter:font-bold [&_strong]:font-bold [&_em]:italic" style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"opsz" 12, "SOFT" 0, "WONK" 0' }}>
                {mode === "preview" || reduce || data.messageStyle === "fade" ? <RichMessage blocks={blocks} stagger={mode === "preview" ? 0 : 0.4} /> : <Typewriter blocks={blocks} active={started} speed={60} />}
              </div>
              <p className="mt-2 text-[10px] italic opacity-70">— {data.senderName}</p>
            </div>
            <aside className="flex flex-col gap-4">
              <Box title={s.weather} ink={ink}>
                <p className="text-[2rem] leading-none">☀️</p>
                <p className="mt-1 text-[13px] leading-snug">{data.fields.weather || s.weatherDefault}</p>
              </Box>
              {data.fields.ads.length ? (
                <Box title={s.classifieds} ink={ink}>
                  <ul className="flex flex-col gap-2 text-[12px] leading-snug">
                    {data.fields.ads.map((ad, i) => (
                      <li key={i} className="border-b border-dashed pb-2 last:border-0" style={{ borderColor: `${ink}55` }}>
                        {ad}
                      </li>
                    ))}
                  </ul>
                </Box>
              ) : null}
              {data.fields.horoscope ? (
                <Box title={s.horoscope} ink={ink}>
                  <p className="text-[13px] leading-snug italic">{data.fields.horoscope}</p>
                </Box>
              ) : null}
            </aside>
          </div>

          {/* More photos */}
          {rest.length ? (
            <section className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3" style={{ borderColor: ink }}>
              {rest.map((p) => (
                <figure key={p.id}>
                  <img src={p.url} alt={p.alt ?? ""} className="aspect-[4/3] w-full object-cover grayscale-[0.2]" loading="lazy" />
                  {p.caption ? <figcaption className="mt-1 text-[10px] leading-snug">{p.caption}</figcaption> : null}
                </figure>
              ))}
            </section>
          ) : null}

          <p className="mt-6 border-t pt-2 text-center text-[10px] tracking-[0.2em] uppercase" style={{ borderColor: ink }}>{s.continued} ↓</p>

          {/* Back page */}
          <BackPage data={data} mode={mode} ink={ink} label={s.backPage} onEvent={onEvent} onReact={onReact} onMakeOne={onMakeOne} onReplay={mode === "preview" ? undefined : () => { setLanded(false); setStarted(false); }} />
        </article>
      </motion.div>

      <AnimatePresence>
        {!started ? (
          <motion.button key="tap" type="button" onClick={start} initial={{ opacity: 0 }} animate={{ opacity: landed ? 1 : 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+2rem))] z-30 mx-auto flex h-12 w-fit items-center rounded-full px-7 text-[15px] font-semibold text-paper shadow-lg" style={{ background: "var(--gift-accent)" }}>
            {s.tap}
          </motion.button>
        ) : null}
      </AnimatePresence>
      <SoundToggle audio={audio} locale={data.locale} className="bg-black/20" />
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function Box({ title, ink, children }: { title: string; ink: string; children: React.ReactNode }) {
  return (
    <div className="border p-3" style={{ borderColor: ink }}>
      <p className="mb-2 border-b pb-1 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ borderColor: ink }}>{title}</p>
      {children}
    </div>
  );
}

function BackPage({ data, mode, ink, label, onEvent, onReact, onMakeOne, onReplay }: { data: TemplateProps<FrontPageFields>["data"]; mode: TemplateProps["mode"]; ink: string; label: string; onEvent?: TemplateProps["onEvent"]; onReact?: () => void; onMakeOne?: () => void; onReplay?: () => void }) {
  const t = useGiftStrings(data.locale);
  const ref = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || mode === "preview") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !endedRef.current) {
        endedRef.current = true;
        onEvent?.({ type: "ended" });
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [onEvent, mode]);
  return (
    <section className="mt-10 border-t-[3px] pt-4" style={{ borderColor: ink }}>
      <p className="text-center text-[10px] tracking-[0.25em] uppercase">{label}</p>
      <div className={cn("mt-4 flex flex-col gap-4")}>
        {data.countdown ? <div className="border p-4" style={{ borderColor: ink }}><Countdown countdown={data.countdown} locale={data.locale} tone="light" /></div> : null}
        {data.surprise ? (
          <div className="border p-4" style={{ borderColor: ink }}>
            <p className="mb-3 text-center text-[10px] font-bold tracking-[0.25em] uppercase">{t("ps")}</p>
            <SurpriseReveal surprise={data.surprise} locale={data.locale} tone="light" onReveal={() => onEvent?.({ type: "surprise" })} />
          </div>
        ) : null}
        <div ref={ref} className="pt-2"><EndScreen data={data} tone="light" onReact={onReact} onMakeOne={onMakeOne} onReplay={onReplay} /></div>
      </div>
    </section>
  );
}
