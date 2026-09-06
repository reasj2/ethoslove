"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import type { RichBlock } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";

type Props = {
  blocks: RichBlock[];
  /** Start typing. Until true nothing is shown. */
  active: boolean;
  /** Characters per second. */
  speed?: number;
  onDone?: () => void;
  className?: string;
  paragraphClassName?: string;
  style?: CSSProperties;
  /** Called with the caret element whenever it moves, so a scroller can follow it. */
  onCaretMove?: (el: HTMLElement) => void;
};

/**
 * Builds a per-character timeline so pauses land after punctuation and paragraph breaks.
 * Human typing is never uniform; that irregularity is most of what makes this feel written.
 */
function buildTimeline(blocks: RichBlock[], speed: number): number[] {
  const base = 1000 / speed;
  const times: number[] = [];
  let t = 0;
  blocks.forEach((block, bi) => {
    block.forEach((run) => {
      if (run.br) {
        t += base * 4;
        times.push(t);
        return;
      }
      for (const ch of run.text) {
        let dt = base;
        if (".!?".includes(ch)) dt = base * 7;
        else if (",;:".includes(ch)) dt = base * 3.2;
        else if (ch === " ") dt = base * 0.85;
        else if ("—…".includes(ch)) dt = base * 4;
        // A touch of jitter so it never feels metronomic.
        dt *= 0.8 + ((times.length * 7919) % 100) / 250;
        t += dt;
        times.push(t);
      }
    });
    if (bi < blocks.length - 1) t += base * 9;
  });
  return times;
}

type Paragraph = { nodes: ReactNode[]; isLast: boolean };

/** Slice the rich blocks at `shown` visible characters. Pure; no closures mutate state. */
function sliceBlocks(blocks: RichBlock[], shown: number): Paragraph[] {
  const out: Paragraph[] = [];
  let remaining = shown;
  for (let bi = 0; bi < blocks.length; bi++) {
    if (remaining <= 0 && bi > 0) break;
    const block = blocks[bi];
    const nodes: ReactNode[] = [];
    for (let ri = 0; ri < block.length; ri++) {
      if (remaining <= 0) break;
      const run = block[ri];
      if (run.br) {
        remaining -= 1;
        nodes.push(<br key={ri} />);
        continue;
      }
      const text = run.text.slice(0, remaining);
      remaining -= run.text.length;
      nodes.push(<span key={ri}>{run.bold ? <strong>{text}</strong> : run.italic ? <em>{text}</em> : text}</span>);
    }
    out.push({ nodes, isLast: remaining <= 0 || bi === blocks.length - 1 });
  }
  return out;
}

export function Typewriter({ blocks, active, speed = 34, onDone, className, paragraphClassName, style, onCaretMove }: Props) {
  const reduce = useReducedMotion();
  const timeline = useMemo(() => buildTimeline(blocks, speed), [blocks, speed]);
  const total = timeline.length;
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const onCaretMoveRef = useRef(onCaretMove);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    onDoneRef.current = onDone;
    onCaretMoveRef.current = onCaretMove;
  }, [onDone, onCaretMove]);

  const shown = reduce && active ? total : count;
  const finished = shown >= total;

  useEffect(() => {
    if (!active || reduce) return;
    doneRef.current = false;
    let raf = 0;
    const startedAt = performance.now();
    let cursor = 0;
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      while (cursor < total && timeline[cursor] <= elapsed) cursor += 1;
      setCount(cursor);
      if (cursor < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce, timeline, total]);

  useEffect(() => {
    if (finished && active && !doneRef.current) {
      doneRef.current = true;
      onDoneRef.current?.();
    }
  }, [finished, active]);

  useEffect(() => {
    if (caretRef.current && !finished) onCaretMoveRef.current?.(caretRef.current);
  }, [shown, finished]);

  if (!active) return null;

  const paragraphs = sliceBlocks(blocks, shown);

  return (
    <div className={cn("whitespace-pre-wrap", className)} style={style} aria-live="polite">
      {paragraphs.map((p, bi) => (
        <p key={bi} className={paragraphClassName}>
          {p.nodes}
          {p.isLast && !finished ? (
            <span
              ref={caretRef}
              aria-hidden="true"
              className="tw-caret ml-px inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-current align-baseline"
            />
          ) : null}
        </p>
      ))}
      <style>{`.tw-caret{animation:tw-blink 1s steps(2,start) infinite}@keyframes tw-blink{to{visibility:hidden}}`}</style>
    </div>
  );
}
