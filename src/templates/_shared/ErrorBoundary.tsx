"use client";

import { Component, type ReactNode } from "react";
import type { GiftLocale } from "@/lib/gift/schema";
import { giftString } from "./i18n";

type Props = { children: ReactNode; locale: GiftLocale };
type State = { error: Error | null };

/** Keeps a template crash from taking down the page chrome around it. */
export class TemplateErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[gift] template crashed", error);
  }

  render() {
    if (this.state.error) {
      const { locale } = this.props;
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-night p-8 text-center text-paper">
          <p className="font-display text-2xl">{giftString(locale, "errorTitle")}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/15"
          >
            {giftString(locale, "errorRetry")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
