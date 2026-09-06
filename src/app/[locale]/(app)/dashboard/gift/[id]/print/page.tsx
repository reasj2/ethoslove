import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { setRequestLocale } from "next-intl/server";
import type { GiftData, GiftLocale } from "@/lib/gift/schema";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getGiftDetail } from "@/lib/gift/dashboard";
import { SITE } from "@/config/site";
import { BRAND } from "@/config/brand";
import { PrintCard } from "@/components/dashboard/print-card";

export const metadata: Metadata = { robots: { index: false } };

/** A6 card, two-up on A4/Letter, print-ready. Server-rendered QR (SVG) so it prints crisp. */
export default async function PrintCardPage({ params }: PageProps<"/[locale]/dashboard/gift/[id]/print">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  const detail = user ? await getGiftDetail(user.id, id) : null;
  if (!detail) notFound();
  const data = detail.gift.data as unknown as Partial<GiftData>;
  const url = `${SITE.url}${SITE.giftPath}/${detail.gift.short_id}`;
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H", margin: 0, color: { dark: data.accentColor ?? "#1A1614", light: "#00000000" } });
  return (
    <PrintCard
      svg={svg}
      url={url}
      recipientName={data.recipientName ?? ""}
      senderName={data.senderName ?? ""}
      accent={data.accentColor ?? "#E8604C"}
      locale={(data.locale ?? locale) as GiftLocale}
      brand={BRAND.name}
    />
  );
}
