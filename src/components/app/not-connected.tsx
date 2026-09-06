import { PlugZap } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function NotConnected() {
  const t = await getTranslations("auth");
  return (
    <div className="mx-6 my-8 flex items-start gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold/5 p-5 text-sm">
      <PlugZap className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
      <div>
        <p className="font-medium">{t("notConfiguredTitle")}</p>
        <p className="mt-1 text-muted-foreground">{t("notConfiguredDetail")}</p>
      </div>
    </div>
  );
}
