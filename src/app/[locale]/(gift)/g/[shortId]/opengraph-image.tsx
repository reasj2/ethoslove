import { ImageResponse } from "next/og";
import { fetchPublicGift } from "@/lib/gift/public";
import { isShortId } from "@/lib/gift/short-id";

export const alt = "Someone made you something";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Never reveals template content — just the name and the invitation. */
export default async function Image({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params;
  const gift = isShortId(shortId) ? await fetchPublicGift(shortId) : null;
  const name = gift?.recipientName || "Hey";
  const es = gift?.locale === "es";
  const line = es ? "alguien te ha hecho algo" : "someone made you something";
  const sub = es ? "Ábrelo con el sonido activado" : "Open it with your sound on";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(80% 60% at 50% 0%, #3a2a26 0%, #141110 60%)", color: "#FAF7F2", fontFamily: "Georgia, serif" }}>
        <div style={{ width: 120, height: 120, borderRadius: 999, background: "radial-gradient(circle at 36% 30%, #F4C7C3, #E8604C 48%, #B23A2E 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(232,96,76,0.35)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: "#FFF8F4", opacity: 0.95 }} />
        </div>
        <div style={{ marginTop: 44, fontSize: 68, fontStyle: "italic", letterSpacing: -1, display: "flex" }}>
          {name}, {line} 💌
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: "rgba(250,247,242,0.6)", fontFamily: "Helvetica, Arial, sans-serif", display: "flex" }}>{sub}</div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 24, color: "rgba(250,247,242,0.45)", fontFamily: "Helvetica, Arial, sans-serif", display: "flex" }}>ethoslove.com</div>
      </div>
    ),
    { ...size },
  );
}
