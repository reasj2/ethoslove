import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OCCASIONS, OCCASION_META } from "@/config/occasions";

/** Magazine-index style list, not a card grid. */
export async function OccasionsIndex() {
  const t = await getTranslations();
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-eyebrow text-coral">{t("home.occasions.eyebrow")}</p>
          <h2 className="display-xl mt-3">{t("home.occasions.title")}</h2>
          <p className="mt-4 max-w-md text-lg text-ink-soft">{t("home.occasions.blurb")}</p>
        </div>
        <ol className="grid border-t border-border sm:grid-cols-2 sm:gap-x-10">
          {OCCASIONS.map((o, i) => (
            <li key={o} className="border-b border-border">
              <Link href={`/occasions/${o}`} className="group flex items-baseline gap-4 py-4 transition-colors hover:text-coral">
                <span className="font-display w-8 text-sm text-muted-foreground tabular-nums italic">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl">{t(`occasions.${o}`)}</span>
                <span className="ml-auto text-xl opacity-70 transition-transform group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true">
                  {OCCASION_META[o].emoji}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
