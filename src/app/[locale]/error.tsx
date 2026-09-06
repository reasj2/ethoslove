"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="display-lg">{t("title")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("detail")}</p>
      <Button onClick={reset} className="mt-8 rounded-full">
        {t("retry")}
      </Button>
    </div>
  );
}
