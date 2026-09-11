import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BotanicalBackdrop } from "@/components/marketing/botanical-backdrop";

export async function FinalCta() {
  const t = await getTranslations("home.final");
  return (
    <section className="relative isolate overflow-hidden bg-forest py-28 text-cream lg:py-40">
      <BotanicalBackdrop />
      <div className="container-x relative flex flex-col items-center text-center">
        <h2 className="display-hero italic">{t("title")}</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">{t("blurb")}</p>
        <Link
          href="/templates"
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-cream px-8 text-base font-semibold text-forest shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-0.5"
        >
          {t("cta")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
