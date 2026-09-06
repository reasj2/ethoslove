"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Monitor } from "lucide-react";
import { parseRichText } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";
import type { TemplateProps } from "../types";
import { useGiftStrings } from "../_shared/i18n";
import { RichMessage } from "../_shared/RichMessage";
import { Typewriter } from "../_shared/Typewriter";
import { Countdown } from "../_shared/Countdown";
import { SurpriseReveal } from "../_shared/SurpriseReveal";
import { EndScreen } from "../_shared/EndScreen";
import type { ArcadeFields } from "./schema";
import { CatchGame, W, H, type GameState } from "./Game";

const S = {
  en: {
    press: "TAP TO START",
    drag: "DRAG TO MOVE · CATCH {n}",
    level: "LEVEL {n}",
    clear: "LEVEL CLEAR",
    unlocked: "PHOTO UNLOCKED",
    next: "NEXT LEVEL",
    again: "TRY AGAIN",
    fail: "OUCH",
    win: "YOU WIN",
    score: "SCORE",
    read: "READ MESSAGE",
    crt: "CRT",
    skip: "SKIP LEVEL",
    quest: "QUEST",
    bad: "avoid the grey ones",
  },
  es: {
    press: "TOCA PARA EMPEZAR",
    drag: "ARRASTRA · ATRAPA {n}",
    level: "NIVEL {n}",
    clear: "NIVEL SUPERADO",
    unlocked: "FOTO DESBLOQUEADA",
    next: "SIGUIENTE NIVEL",
    again: "OTRA VEZ",
    fail: "AY",
    win: "HAS GANADO",
    score: "PUNTOS",
    read: "LEER MENSAJE",
    crt: "CRT",
    skip: "SALTAR NIVEL",
    quest: "QUEST",
    bad: "esquiva los grises",
  },
};

type Phase = "title" | "playing" | "clear" | "fail" | "win";

export function Template({ data, mode, onEvent, onReact, onMakeOne }: TemplateProps<ArcadeFields>) {
  const reduce = useReducedMotion();
  const t = useGiftStrings(data.locale);
  const s = S[data.locale] ?? S.en;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<CatchGame | null>(null);
  const [phase, setPhase] = useState<Phase>(mode === "preview" ? "win" : "title");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [crt, setCrt] = useState(data.fields.crt);
  const [extras, setExtras] = useState(mode === "preview");
  const levels = Math.max(1, Math.min(8, data.photos.length));
  const blocks = useMemo(() => parseRichText(data.message), [data.message]);
  const title = data.fields.title || `${data.recipientName.toUpperCase()} ${s.quest}`;

  const onClear = useCallback(
    (st: GameState) => {
      setScore(st.score);
      setPhase(st.level >= levels ? "win" : "clear");
      onEvent?.({ type: "progress", pct: Math.round((st.level / levels) * 80) });
    },
    [levels, onEvent],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode === "preview") return;
    const game = new CatchGame(canvas, {
      onCatch: (st) => setScore(st.score),
      onMiss: () => {},
      onLevelClear: onClear,
      onFail: () => setPhase("fail"),
    });
    game.perLevel = data.fields.perLevel;
    game.sprite = data.fields.item;
    game.accent = data.accentColor;
    game.reduced = !!reduce;
    gameRef.current = game;
    return () => game.stop();
  }, [mode, data.fields.perLevel, data.fields.item, data.accentColor, reduce, onClear]);

  const play = (lv: number) => {
    const game = gameRef.current;
    if (!game) return;
    game.enableSound();
    setLevel(lv);
    setPhase("playing");
    game.startLevel(lv);
    if (lv === 1 && phase === "title") onEvent?.({ type: "started" });
  };

  const move = (e: ReactPointerEvent) => {
    const frame = frameRef.current;
    const game = gameRef.current;
    if (!frame || !game) return;
    const r = frame.getBoundingClientRect();
    game.basketX = Math.max(14, Math.min(W - 14, ((e.clientX - r.left) / r.width) * W));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g) return;
      if (e.key === "ArrowLeft") g.basketX = Math.max(14, g.basketX - 12);
      if (e.key === "ArrowRight") g.basketX = Math.min(W - 14, g.basketX + 12);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const photo = data.photos[Math.min(level, levels) - 1];

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0b0d16] text-[#e9e4d8] select-none"
      style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(var(--gift-accent-rgb),0.12),transparent)]" />
      <p className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] right-0 left-0 z-20 text-center text-[11px] tracking-[0.3em] opacity-60">
        {data.senderName} → {data.recipientName}
      </p>

      {/* Cabinet */}
      <div
        ref={frameRef}
        onPointerDown={move}
        onPointerMove={(e) => e.buttons === 1 && move(e)}
        className="relative z-10 touch-none rounded-[14px] border-[6px] border-[#2a2f45] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.9),inset_0_0_0_2px_#0b0d16]"
        style={{ width: "min(82cqw, 56cqh)", aspectRatio: `${W} / ${H}` }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-full w-full [image-rendering:pixelated]"
          aria-label={title}
        />
        {crt ? (
          <div className="pointer-events-none absolute inset-0 rounded-[8px] bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
        ) : null}

        {phase !== "playing" ? (
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0d16]/85 p-4 text-center"
          >
            {phase === "title" ? (
              <>
                <p
                  className="text-[clamp(1.2rem,6cqw,1.8rem)] leading-tight font-bold tracking-wider"
                  style={{ color: "var(--gift-accent)", textShadow: "2px 2px 0 #000" }}
                >
                  {title}
                </p>
                <p className="text-[10px] opacity-70">
                  {s.drag.replace("{n}", String(data.fields.perLevel))}
                </p>
                <p className="text-[10px] opacity-50">{s.bad}</p>
                <motion.button
                  type="button"
                  onClick={() => play(1)}
                  animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="mt-3 text-[12px] font-bold tracking-widest"
                >
                  ▶ {s.press}
                </motion.button>
              </>
            ) : null}
            {phase === "clear" || phase === "win" ? (
              <>
                <p
                  className="text-[12px] font-bold tracking-widest"
                  style={{ color: "var(--gift-accent)" }}
                >
                  {phase === "win" ? s.win : s.clear}
                </p>
                <p className="text-[9px] opacity-60">{s.unlocked}</p>
                {photo ? (
                  <motion.figure
                    initial={{ scale: 0.6, rotate: -6 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="w-[70%] border-2 border-[#e9e4d8] bg-[#e9e4d8] p-1"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt ?? ""}
                      className="aspect-[4/3] w-full object-cover [image-rendering:auto]"
                    />
                    {photo.caption ? (
                      <figcaption className="mt-1 truncate text-[8px] text-[#0b0d16]">
                        {photo.caption}
                      </figcaption>
                    ) : null}
                  </motion.figure>
                ) : null}
                <p className="text-[9px]">
                  {s.score} {score}
                </p>
                {phase === "clear" ? (
                  <button
                    type="button"
                    onClick={() => play(level + 1)}
                    className="mt-1 rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#0b0d16]"
                    style={{ background: "var(--gift-accent)" }}
                  >
                    ▶ {s.next}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setExtras(true);
                      onEvent?.({ type: "progress", pct: 90 });
                    }}
                    className="mt-1 rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#0b0d16]"
                    style={{ background: "var(--gift-accent)" }}
                  >
                    ▶ {s.read}
                  </button>
                )}
              </>
            ) : null}
            {phase === "fail" ? (
              <>
                <p className="text-[14px] font-bold tracking-widest text-[#f07a67]">{s.fail}</p>
                <p className="text-[9px] opacity-60">{s.level.replace("{n}", String(level))}</p>
                <button
                  type="button"
                  onClick={() => play(level)}
                  className="mt-2 rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#0b0d16]"
                  style={{ background: "var(--gift-accent)" }}
                >
                  ▶ {s.again}
                </button>
                <button
                  type="button"
                  onClick={() => onClear({ level, caught: 0, misses: 0, score })}
                  className="text-[9px] underline opacity-60"
                >
                  {s.skip}
                </button>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      {/* Controls */}
      <div className="z-10 mt-4 flex items-center gap-3 text-[10px] tracking-widest opacity-70">
        <button
          type="button"
          onClick={() => setCrt((v) => !v)}
          className={cn(
            "flex items-center gap-1 rounded-sm border px-2 py-1",
            crt ? "border-[#e9e4d8]" : "border-[#3a3f55] opacity-60",
          )}
        >
          <Monitor className="size-3" />
          {s.crt} {crt ? "ON" : "OFF"}
        </button>
        <span>
          {s.level.replace("{n}", String(level))} / {levels}
        </span>
      </div>

      {/* Message */}
      <AnimatePresence>
        {extras ? (
          <motion.div
            key="extras"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="absolute inset-0 z-30 scrollbar-none overflow-y-auto bg-[#0b0d16]"
          >
            <MessagePanel
              data={data}
              mode={mode}
              blocks={blocks}
              reduce={!!reduce}
              score={score}
              scoreLabel={s.score}
              onEvent={onEvent}
              onReact={onReact}
              onMakeOne={onMakeOne}
              onReplay={
                mode === "preview"
                  ? undefined
                  : () => {
                      setExtras(false);
                      setPhase("title");
                      setLevel(1);
                      setScore(0);
                    }
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="hidden">{t("theEnd")}</span>
    </div>
  );
}

function MessagePanel({
  data,
  mode,
  blocks,
  reduce,
  score,
  scoreLabel,
  onEvent,
  onReact,
  onMakeOne,
  onReplay,
}: {
  data: TemplateProps<ArcadeFields>["data"];
  mode: TemplateProps["mode"];
  blocks: ReturnType<typeof parseRichText>;
  reduce: boolean;
  score: number;
  scoreLabel: string;
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
  return (
    <div
      className="mx-auto flex w-[min(90cqw,520px)] flex-col gap-5 pt-[max(10cqh,56px)] pb-[max(2rem,env(safe-area-inset-bottom))] text-[#e9e4d8]"
      style={{ fontFamily: "var(--gift-font-body)" }}
    >
      <p className="text-center font-mono text-[11px] tracking-[0.3em] opacity-60">
        {scoreLabel} {score} · ★★★
      </p>
      <div className="rounded-[6px] border-2 border-[#2a2f45] bg-[#12162a] p-6 sm:p-8">
        <h2
          className="font-mono text-[clamp(1.1rem,5cqw,1.4rem)] font-bold tracking-wider"
          style={{ color: "var(--gift-accent)" }}
        >
          {t("dear", { name: data.recipientName }).toUpperCase()}
        </h2>
        <div className="mt-4 text-[clamp(1rem,4.4cqw,1.1rem)] leading-relaxed [&_em]:opacity-80 [&_p+p]:mt-4 [&_strong]:font-semibold [&_strong]:text-white">
          {instant ? (
            <RichMessage
              blocks={blocks}
              stagger={mode === "preview" ? 0 : 0.5}
              onDone={() => setDone(true)}
            />
          ) : (
            <Typewriter blocks={blocks} active speed={40} onDone={() => setDone(true)} />
          )}
        </div>
        {done ? (
          <p
            className="mt-5 text-right font-mono text-sm tracking-widest"
            style={{ color: "var(--gift-accent)" }}
          >
            — {data.senderName.toUpperCase()}
          </p>
        ) : null}
      </div>
      {done && data.countdown ? (
        <div className="rounded-[6px] border-2 border-[#2a2f45] bg-[#12162a] p-5">
          <Countdown countdown={data.countdown} locale={data.locale} tone="dark" />
        </div>
      ) : null}
      {done && data.surprise ? (
        <div className="rounded-[6px] border-2 border-[#2a2f45] bg-[#12162a] p-5">
          <p className="mb-3 text-center font-mono text-[10px] tracking-[0.3em] opacity-60">
            {t("ps").toUpperCase()}
          </p>
          <SurpriseReveal
            surprise={data.surprise}
            locale={data.locale}
            tone="dark"
            onReveal={() => onEvent?.({ type: "surprise" })}
          />
        </div>
      ) : null}
      {done ? (
        <div ref={endRef} className="pt-2">
          <EndScreen
            data={data}
            tone="dark"
            onReact={onReact}
            onMakeOne={onMakeOne}
            onReplay={onReplay}
          />
        </div>
      ) : null}
    </div>
  );
}
