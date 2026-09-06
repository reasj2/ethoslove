"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftData, GiftLocale } from "@/lib/gift/schema";
import type { TemplateEvent } from "@/templates/types";
import { GiftRenderer } from "@/templates/_shared/GiftRenderer";
import { SoundGate } from "./sound-gate";
import { ReactionSheet } from "./reaction-sheet";
import { HomeScreenTip } from "./home-screen-tip";

/** The recipient's whole visit: gate → template → reaction, with anonymous view tracking. */
export function GiftExperience({ shortId, data, locale }: { shortId: string; data: GiftData; locale: GiftLocale }) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [reactOpen, setReactOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const viewId = useRef<string | null>(null);
  const lastPct = useRef(0);

  const open = useCallback(() => {
    setOpened(true);
    fetch(`/api/gift/${shortId}/view`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.viewId) viewId.current = j.viewId;
      })
      .catch(() => {});
  }, [shortId]);

  const onEvent = useCallback(
    (e: TemplateEvent) => {
      const report = (pct: number) => {
        if (!viewId.current || pct <= lastPct.current) return;
        lastPct.current = pct;
        void fetch(`/api/gift/${shortId}/view`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ viewId: viewId.current, pct }), keepalive: true });
      };
      if (e.type === "progress") report(e.pct);
      if (e.type === "ended") {
        report(100);
        setEnded(true);
      }
    },
    [shortId],
  );

  return (
    <div className="relative h-dvh w-full bg-night">
      {opened ? (
        <GiftRenderer
          slug={data.templateSlug}
          data={data}
          mode="live"
          replayKey={replayKey}
          onEvent={onEvent}
          onReact={data.showReactionCta ? () => setReactOpen(true) : undefined}
          onMakeOne={() => router.push(`/?ref=${shortId}`)}
        />
      ) : null}
      {!opened ? <SoundGate recipientName={data.recipientName} senderName={data.senderName} locale={locale} onOpen={open} /> : null}
      <ReactionSheet open={reactOpen} onClose={() => setReactOpen(false)} shortId={shortId} senderName={data.senderName} locale={locale} />
      {ended ? <HomeScreenTip locale={locale} onReplay={() => setReplayKey((k) => k + 1)} /> : null}
    </div>
  );
}
