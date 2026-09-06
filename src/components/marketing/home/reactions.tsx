"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

/**
 * "See the reaction". Illustrated placeholders in a message-thread style; swap for
 * real reaction videos when you have them (each card becomes a <video>).
 */
export function Reactions() {
  const t = useTranslations("home.reactions");
  const cards = t.raw("cards") as { from: string; to: string; sent: string; reply: string; emoji: string; time: string }[];
  return (
    <section className="border-b border-border bg-paper-deep/50 py-20 lg:py-28">
      <div className="container-x">
        <div className="max-w-xl">
          <p className="text-eyebrow text-coral">{t("eyebrow")}</p>
          <h2 className="display-xl mt-3">{t("title")}</h2>
          <p className="mt-4 text-lg text-ink-soft">{t("blurb")}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.2 : -1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.8 : -0.8 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, delay: i * 0.1 }}
              className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft"
            >
              <figcaption className="flex items-center justify-between text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                <span>{c.from} → {c.to}</span>
                <span>{c.time}</span>
              </figcaption>
              <div className="mt-4 flex flex-col gap-2.5">
                <p className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-ink px-3.5 py-2.5 text-sm text-paper">{c.sent}</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200, damping: 16 }}
                  className="max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-deep px-3.5 py-2.5 text-sm"
                >
                  {c.reply}
                </motion.p>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-3xl"
                  aria-hidden="true"
                >
                  {c.emoji}
                </motion.span>
              </div>
            </motion.figure>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t("placeholderNote")}</p>
      </div>
    </section>
  );
}
