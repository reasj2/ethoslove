"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { parseRichText } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";
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
import type { FortuneFields } from "./schema";

const TABLE: Record<
  FortuneFields["table"],
  { bg: string; ink: string; plate: string; tone: "light" | "dark" }
> = {
  red: {
    bg: "linear-gradient(180deg,#8e1f1f 0%,#5e1212 100%)",
    ink: "#f8efe0",
    plate: "#f3ead8",
    tone: "dark",
  },
  jade: {
    bg: "linear-gradient(180deg,#2f6b5a 0%,#1d4a3e 100%)",
    ink: "#f2f7f3",
    plate: "#f3f1e8",
    tone: "dark",
  },
  linen: {
    bg: "linear-gradient(180deg,#efe6d6 0%,#dccdb6 100%)",
    ink: "#1A1614",
    plate: "#fbf7ee",
    tone: "light",
  },
};

const S = {
  en: {
    tap: "Tap a cookie",
    crack: "Crack it open",
    lucky: "Lucky numbers",
    left: "{n} left",
    last: "The last one is the real one.",
    close: "Tap to eat the cookie",
    open: "Open the last one",
    learn: "Learn Chinese: 爱 · love",
  },
  es: {
    tap: "Toca una galleta",
    crack: "Ábrela",
    lucky: "Números de la suerte",
    left: "Quedan {n}",
    last: "La última es la de verdad.",
    close: "Toca para comerte la galleta",
    open: "Abrir la última",
    learn: "Aprende chino: 爱 · amor",
  },
};

export function Template({
  data,
  mode,
  onEvent,
  onReact,
  onMakeOne,
}: TemplateProps<FortuneFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const audio = useGiftAudio(data.music, mode !== "preview");
  const table = TABLE[data.fields.table] ?? TABLE.red;
  const fortunes = useMemo(
    () => (data.fields.fortunes.length ? data.fields.fortunes : ["…"]),
    [data.fields.fortunes],
  );
  const total = fortunes.length + 1; // + the real one
  const [opened, setOpened] = useState<boolean[]>(() =>
    Array.from({ length: total }, (_, i) => mode === "preview" && i === 0),
  );
  const [active, setActive] = useState<number | null>(mode === "preview" ? 0 : null);
  const [started, setStarted] = useState(mode === "preview");
  const [finale, setFinale] = useState(false);
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const openedCount = opened.filter(Boolean).length;
  const remaining = total - openedCount;
  const seed = hashString(data.recipientName + total);
  const layout = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: total }, (_, i) => {
      const cols = total <= 4 ? 2 : 3;
      const rows = Math.ceil(total / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const spread = rows <= 2 ? 34 : rows === 3 ? 26 : 19;
      const top = 50 - ((rows - 1) * spread) / 2;
      return {
        x: 24 + (col / (cols - 1)) * 52 + (rng() - 0.5) * 6,
        y: top + row * spread + (rng() - 0.5) * 5,
        rot: (rng() - 0.5) * 40,
      };
    });
  }, [seed, total]);

  const crack = (i: number) => {
    if (opened[i] || active !== null) return;
    if (!started) {
      setStarted(true);
      void audio.start();
      onEvent?.({ type: "started" });
    }
    setOpened((o) => o.map((v, k) => (k === i ? true : v)));
    setActive(i);
    onEvent?.({ type: "progress", pct: Math.round(((openedCount + 1) / total) * 70) });
  };

  const isReal = active === total - 1;

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: table.bg, color: table.ink, fontFamily: "var(--gift-font-body)" }}
    >
      <div className="grain-overlay opacity-[0.08]" />
      {/* Header */}
      <div className="absolute inset-x-0 top-[max(1.25rem,calc(env(safe-area-inset-top)+0.75rem))] z-20 px-6 text-center">
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

      {/* Plate */}
      <div
        className="absolute top-[19%] left-1/2 w-[min(90cqw,440px)] -translate-x-1/2"
        style={{ aspectRatio: "1 / 1.05" }}
      >
        <div
          className="absolute inset-[3%] rounded-[50%] shadow-[0_30px_50px_-20px_rgba(0,0,0,0.6),inset_0_0_0_10px_rgba(0,0,0,0.05)]"
          style={{ background: table.plate }}
        />
        <div
          className="absolute inset-[9%] rounded-[50%] border-2 border-dashed opacity-25"
          style={{ borderColor: "var(--gift-accent)" }}
        />
        {layout.map((pos, i) => (
          <Cookie
            key={i}
            index={i}
            pos={pos}
            opened={opened[i]}
            real={i === total - 1}
            onCrack={() => crack(i)}
            reduce={!!reduce}
            label={s.crack}
          />
        ))}
      </div>

      {/* Footer hint */}
      <AnimatePresence>
        {active === null ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-[max(2.5rem,calc(env(safe-area-inset-bottom)+2rem))] z-20 flex flex-col items-center gap-2 px-8 text-center"
          >
            {remaining > 1 ? (
              <>
                <motion.p
                  animate={reduce ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="text-[13px] tracking-[0.22em] uppercase opacity-80"
                >
                  {s.tap}
                </motion.p>
                <p className="text-xs opacity-60">{s.left.replace("{n}", String(remaining))}</p>
              </>
            ) : remaining === 1 ? (
              <p
                className="text-[clamp(1.1rem,5cqw,1.3rem)] italic"
                style={{ fontFamily: "var(--gift-font-display)" }}
              >
                {s.last}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFinale(true);
                  onEvent?.({ type: "progress", pct: 85 });
                }}
                className="h-12 rounded-full px-7 text-[15px] font-semibold shadow-lg"
                style={{ background: "var(--gift-accent)", color: "var(--gift-on-accent)" }}
              >
                {s.open}
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Slip */}
      <AnimatePresence>
        {active !== null ? (
          <motion.div
            key={`slip-${active}`}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setActive(null);
              if (isReal) setFinale(true);
            }}
          >
            <motion.div
              initial={{ y: 60, scaleX: 0.3, opacity: 0, rotate: -6 }}
              animate={{ y: 0, scaleX: 1, opacity: 1, rotate: -1 }}
              exit={{ y: -30, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.25 }}
              className="relative w-[min(88cqw,420px)] bg-[#fbf6e9] px-6 py-5 text-center text-[#2a2420] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 22px, rgba(200,116,58,0.12) 22px 23px)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: "var(--gift-accent)" }}
              />
              <p
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "var(--gift-accent)" }}
              >
                {isReal ? "♥" : `№ ${active + 1}`}
              </p>
              {!isReal && active < data.photos.length ? (
                <img
                  src={data.photos[active].url}
                  alt={data.photos[active].alt ?? ""}
                  className="mx-auto mt-3 h-24 w-24 rotate-2 rounded-sm object-cover shadow-md"
                />
              ) : null}
              <p
                className="mt-3 text-[clamp(1.05rem,4.8cqw,1.3rem)] leading-snug"
                style={{
                  fontFamily: "var(--gift-font-display)",
                  fontStyle: isReal ? "italic" : "normal",
                }}
              >
                {isReal ? s.last : fortunes[active]}
              </p>
              {data.fields.luckyNumbers ? (
                <p className="mt-3 text-[11px] tracking-[0.15em] uppercase opacity-60">
                  {s.lucky}: {data.fields.luckyNumbers}
                </p>
              ) : null}
              <p className="mt-1 text-[10px] opacity-40">{s.learn}</p>
              <p className="mt-3 text-[11px] opacity-50">{s.close}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Finale */}
      <AnimatePresence>
        {finale ? (
          <motion.div
            key="finale"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="absolute inset-0 z-40 scrollbar-none overflow-y-auto"
            style={{ background: table.bg }}
          >
            <Finale
              data={data}
              mode={mode}
              blocks={blocks}
              reduce={!!reduce}
              tone={table.tone}
              onEvent={onEvent}
              onReact={onReact}
              onMakeOne={onMakeOne}
              onReplay={
                mode === "preview"
                  ? undefined
                  : () => {
                      setFinale(false);
                      setOpened(Array(total).fill(false));
                      setActive(null);
                    }
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SoundToggle audio={audio} locale={data.locale} />
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function Cookie({
  index,
  pos,
  opened,
  real,
  onCrack,
  reduce,
  label,
}: {
  index: number;
  pos: { x: number; y: number; rot: number };
  opened: boolean;
  real: boolean;
  onCrack: () => void;
  reduce: boolean;
  label: string;
}) {
  const style: CSSProperties = {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: `translate(-50%,-50%) rotate(${pos.rot}deg)`,
  };
  const gid = `ck${index}`;
  return (
    <button
      type="button"
      onClick={onCrack}
      aria-label={`${label} ${index + 1}`}
      data-cookie={index}
      className={cn("absolute h-[20%] w-[28%]", opened && "pointer-events-none")}
      style={style}
    >
      <motion.div
        className="relative h-full w-full"
        animate={opened ? {} : reduce ? {} : { y: [0, -2, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.2 }}
      >
        {[-1, 1].map((side) => (
          <motion.svg
            key={side}
            viewBox="0 0 100 80"
            className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]"
            animate={
              opened
                ? { x: side * 22, rotate: side * 24, y: side < 0 ? 6 : -4 }
                : { x: 0, rotate: 0, y: 0 }
            }
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          >
            <defs>
              <radialGradient id={`${gid}-${side}`} cx="45%" cy="25%" r="80%">
                <stop offset="0" stopColor="#f6d59c" />
                <stop offset="0.55" stopColor="#dda352" />
                <stop offset="1" stopColor="#a8682a" />
              </radialGradient>
            </defs>
            {/* A folded crescent: the outer curve is the shell, the inner curve is the pinched fold. */}
            <path
              d={
                side < 0
                  ? "M50 72 C34 78 6 66 4 42 C2 18 26 4 50 8 L50 38 C42 44 42 58 50 72 Z"
                  : "M50 72 C66 78 94 66 96 42 C98 18 74 4 50 8 L50 38 C58 44 58 58 50 72 Z"
              }
              fill={`url(#${gid}-${side})`}
              stroke="#8a5322"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d={side < 0 ? "M46 14 C30 16 14 28 12 42" : "M54 14 C70 16 86 28 88 42"}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </motion.svg>
        ))}
        {!opened ? (
          <span
            className="absolute top-[52%] left-1/2 h-[18%] w-[3px] -translate-x-1/2 rounded-full bg-[#fbf6e9]/90"
            aria-hidden="true"
          />
        ) : null}
        {real && !opened ? <span className="absolute -top-1 -right-1 text-sm">✨</span> : null}
        {opened ? (
          <span
            className="absolute inset-0 flex items-center justify-center gap-1"
            aria-hidden="true"
          >
            {[0, 1, 2].map((k) => (
              <motion.span
                key={k}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, 10 + k * 4] }}
                transition={{ duration: 0.8, delay: k * 0.08 }}
                className="size-1.5 rounded-full bg-[#b0722c]"
              />
            ))}
          </span>
        ) : null}
      </motion.div>
    </button>
  );
}

function Finale({
  data,
  mode,
  blocks,
  reduce,
  tone,
  onEvent,
  onReact,
  onMakeOne,
  onReplay,
}: {
  data: TemplateProps<FortuneFields>["data"];
  mode: TemplateProps["mode"];
  blocks: ReturnType<typeof parseRichText>;
  reduce: boolean;
  tone: "light" | "dark";
  onEvent?: TemplateProps["onEvent"];
  onReact?: () => void;
  onMakeOne?: () => void;
  onReplay?: () => void;
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
  const paper = "#fbf6e9";
  return (
    <div className="mx-auto flex w-[min(90cqw,520px)] flex-col gap-5 pt-[max(10cqh,56px)] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div
        className="relative px-7 py-8 text-[#2a2420] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        style={{ background: paper }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: "var(--gift-accent)" }}
        />
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
        <div className="p-5 text-[#2a2420]" style={{ background: paper }}>
          <Countdown countdown={data.countdown} locale={data.locale} tone="light" />
        </div>
      ) : null}
      {done && data.surprise ? (
        <div className="p-5 text-[#2a2420]" style={{ background: paper }}>
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
        <div ref={endRef} className="pt-2">
          <EndScreen
            data={data}
            tone={tone}
            onReact={onReact}
            onMakeOne={onMakeOne}
            onReplay={onReplay}
          />
        </div>
      ) : null}
    </div>
  );
}
