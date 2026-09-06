import { getTranslations } from "next-intl/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export async function Faq() {
  const t = await getTranslations("pricing");
  const faq = t.raw("faq") as { q: string; a: string }[];
  return (
    <section className="border-b border-border py-20 lg:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-eyebrow text-coral">FAQ</p>
          <h2 className="display-xl mt-3">{t("faqTitle")}</h2>
        </div>
        <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
          {faq.map((item, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border-0">
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-ink-soft">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
