import type { GiftLocale } from "@/lib/gift/schema";
import { BRAND } from "@/config/brand";
import { LogoMark } from "@/components/shared/logo";

/** Free-tier footer. Deliberately small and tasteful — it is the viral hook, not an ad. */
export function Watermark({ locale }: { locale: GiftLocale }) {
  return (
    <a
      href="/?ref=watermark"
      target="_blank"
      rel="noopener"
      className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-white/85 shadow-sm backdrop-blur-md transition-colors hover:bg-black/55"
    >
      <LogoMark className="size-3.5" />
      {BRAND.watermark[locale]}
    </a>
  );
}
