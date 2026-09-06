"use client";

import { useState, type FormEvent } from "react";
import { Mail, MailCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const APPLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true";
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== "false";

/** Only allow same-origin relative paths as post-login destinations. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function AuthForm({ mode, next: nextOverride, compact = false }: { mode: "login" | "signup"; next?: string; compact?: boolean }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const search = useSearchParams();
  const next = safeNext(nextOverride ?? search.get("next"));
  const callbackError = search.get("error") === "callback";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "checking" | "wrong">("idle");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  /** The same email carries a 6-digit code; typing it here works even if the link opens elsewhere. */
  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || code.length < 6) return;
    setCodeState("checking");
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) {
      setCodeState("wrong");
      return;
    }
    router.push(next);
    router.refresh();
  };

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const sendMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true, data: { locale } },
    });
    setStatus(error ? "error" : "sent");
  };

  const oauth = async (provider: "google" | "apple") => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } });
  };

  return (
    <div className={compact ? "w-full" : "w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-9"}>
      <h1 className={compact ? "font-display text-xl" : "display-md"}>{mode === "login" ? t("loginTitle") : t("signupTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login" ? t("loginSubtitle") : t("signupSubtitle")}
      </p>

      {!supabase ? (
        <div className="mt-6 rounded-xl border border-dashed border-gold/60 bg-gold/5 p-4 text-sm">
          <p className="font-medium">{t("notConfiguredTitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("notConfiguredDetail")}</p>
        </div>
      ) : status === "sent" ? (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-accent p-6 text-center">
          <MailCheck className="size-8 text-coral" aria-hidden="true" />
          <p className="mt-3 font-medium">{t("linkSent")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("linkSentDetail", { email })}</p>
          <form onSubmit={verifyCode} className="mt-5 flex w-full max-w-xs flex-col gap-2">
            <Label htmlFor="otp" className="text-xs text-muted-foreground">{t("codeLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  if (codeState === "wrong") setCodeState("idle");
                }}
                placeholder="123456"
                className="h-11 text-center font-mono text-lg tracking-[0.3em]"
              />
              <Button type="submit" className="h-11 rounded-full px-5" disabled={code.length < 6 || codeState === "checking"}>
                {codeState === "checking" ? "…" : t("verify")}
              </Button>
            </div>
            {codeState === "wrong" ? <p role="alert" className="text-xs text-destructive">{t("codeWrong")}</p> : <p className="text-xs text-muted-foreground">{t("codeHint")}</p>}
          </form>
          <button type="button" onClick={() => { setStatus("idle"); setCode(""); }} className="mt-4 text-xs text-muted-foreground underline underline-offset-4">
            {t("useAnotherEmail")}
          </button>
        </div>
      ) : (
        <>
          {callbackError ? (
            <p role="alert" className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {t("callbackError")}
            </p>
          ) : null}
          <form onSubmit={sendMagicLink} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="h-11"
              />
            </div>
            <Button type="submit" className="h-11 rounded-full" disabled={status === "sending"}>
              <Mail className="size-4" />
              {status === "sending" ? t("sending") : t("sendLink")}
            </Button>
            {status === "error" ? (
              <p role="alert" className="text-sm text-destructive">
                {t("error")}
              </p>
            ) : null}
          </form>

          {GOOGLE_ENABLED || APPLE_ENABLED ? (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground uppercase">
                <span className="h-px flex-1 bg-border" />
                {t("or")}
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-3">
                {GOOGLE_ENABLED ? (
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => oauth("google")}>
                    <GoogleIcon />
                    {t("continueWithGoogle")}
                  </Button>
                ) : null}
                {APPLE_ENABLED ? (
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => oauth("apple")}>
                    <AppleIcon />
                    {t("continueWithApple")}
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </>
      )}

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-coral">
          {mode === "login" ? t("signupTitle") : t("loginTitle")}
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t.rich("legalNote", {
          terms: (chunks) => (
            <Link href="/legal/terms" className="underline underline-offset-2">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/legal/privacy" className="underline underline-offset-2">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.8-4.3ZM14 5.4c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  );
}
