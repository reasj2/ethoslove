"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Login / My gifts affordance for the (static) marketing pages.
 * Resolves auth on the client so marketing routes stay fully static and cacheable.
 */
export function AuthStatus({ onNavigate, block }: { onNavigate?: () => void; block?: boolean }) {
  const t = useTranslations("common");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthed(Boolean(data.user));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={cn("flex items-center gap-2", block && "flex-col items-stretch")}>
      {authed ? (
        <Button asChild variant="ghost" size="lg" className={cn(block && "h-11")}>
          <Link href="/dashboard" onClick={onNavigate}>
            {t("dashboard")}
          </Link>
        </Button>
      ) : (
        <Button asChild variant="ghost" size="lg" className={cn(block && "h-11")}>
          <Link href="/login" onClick={onNavigate}>
            {t("login")}
          </Link>
        </Button>
      )}
      <Button asChild size="lg" className={cn("rounded-full px-5", block && "h-11")}>
        <Link href="/templates" onClick={onNavigate}>
          {t("createGift")}
        </Link>
      </Button>
    </div>
  );
}
