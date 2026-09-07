"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useScrolledPast } from "@/hooks/use-scrolled-past";

/** Mobile-only floating "Create" button that appears once the hero scrolls away. */
export function StickyCta() {
  const t = useTranslations("common");
  const pathname = usePathname();
  // Only where the page has no strong call to action of its own: home, gallery, occasions.
  const wanted = pathname === "/" || pathname === "/templates" || pathname.startsWith("/occasions");
  const visible = useScrolledPast(480) && wanted;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <Button asChild size="lg" className="h-12 w-full max-w-sm rounded-full text-base shadow-lift">
            <Link href="/templates">{t("createGiftFree")}</Link>
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
