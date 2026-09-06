import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";

export async function FinalCta() {
  const t = await getTranslations("home.final");
  return (
    <section className="relative overflow-hidden bg-night py-24 text-paper lg:py-36">
      <div className="grain-overlay opacity-[0.08]" />
      <div className="container-x relative flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <LogoMark className="size-10" />
          <h2 className="display-hero mt-8 italic">{t("title")}</h2>
          <p className="mt-6 max-w-xl text-lg text-paper/70">{t("blurb")}</p>
        </div>
        <Button asChild size="lg" className="h-14 rounded-full bg-coral px-8 text-base text-paper shadow-glow hover:bg-coral-deep">
          <Link href="/templates">
            {t("cta")}
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
