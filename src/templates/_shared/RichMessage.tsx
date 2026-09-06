"use client";

import { motion } from "motion/react";
import type { RichBlock } from "@/lib/gift/rich-text";
import { cn } from "@/lib/utils";

/** Paragraphs fade in one after another — the non-typewriter message style. */
export function RichMessage({
  blocks,
  active = true,
  stagger = 0.45,
  className,
  paragraphClassName,
  onDone,
}: {
  blocks: RichBlock[];
  active?: boolean;
  stagger?: number;
  className?: string;
  paragraphClassName?: string;
  onDone?: () => void;
}) {
  if (!active) return null;
  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {blocks.map((block, bi) => (
        <motion.p
          key={bi}
          className={paragraphClassName}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: bi * stagger, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={bi === blocks.length - 1 ? onDone : undefined}
        >
          {block.map((run, ri) =>
            run.br ? (
              <br key={ri} />
            ) : run.bold ? (
              <strong key={ri}>{run.text}</strong>
            ) : run.italic ? (
              <em key={ri}>{run.text}</em>
            ) : (
              <span key={ri}>{run.text}</span>
            ),
          )}
        </motion.p>
      ))}
    </div>
  );
}
