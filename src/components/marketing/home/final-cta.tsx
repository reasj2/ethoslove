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
      <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <LogoMark className="size-10" tone="paper" />
          <h2 className="display-hero mt-8 italic">{t("title")}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/70">{t("blurb")}</p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <Button asChild size="lg" className="h-14 rounded-full bg-coral px-8 text-base text-paper hover:bg-coral-deep">
            <Link href="/templates">
              {t("cta")}
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
