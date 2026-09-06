import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { ScratchFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "scratch-card",
  recipientName: "Sofía",
  senderName: "Lucas",
  messageStyle: "fade" as const,
  accentColor: "#D4A853",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/first-snow.wav", trackId: "first-snow", title: "First Snow", startAt: 0 },
  video: undefined,
  countdown: undefined,
  surprise: undefined,
};

export const demoData: Record<"en" | "es", GiftData<ScratchFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Five cards. One question.",
    message: "Four of these are memories. The fifth is a question I've been carrying around in my pocket for three months, next to the ring.\n\n**Scratch the last one slowly.**",
    photos: demoPhotos(["p1", "p2", "p5", "p7"], { p1: "Where it started", p2: "Where we got lost", p5: "Where there was no signal", p7: "Where everything slowed down" }),
    fields: { foil: "gold", finalTitle: "Will you marry me?" },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Cinco tarjetas. Una pregunta.",
    message: "Cuatro de estas son recuerdos. La quinta es una pregunta que llevo tres meses en el bolsillo, junto al anillo.\n\n**Rasca la última despacio.**",
    photos: demoPhotos(["p1", "p2", "p5", "p7"], { p1: "Donde empezó", p2: "Donde nos perdimos", p5: "Donde no había cobertura", p7: "Donde todo fue más despacio" }),
    fields: { foil: "gold", finalTitle: "¿Te casas conmigo?" },
  },
};
