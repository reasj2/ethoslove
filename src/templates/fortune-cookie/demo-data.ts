import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { FortuneFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "fortune-cookie",
  recipientName: "Ana",
  senderName: "Marco",
  messageStyle: "typewriter" as const,
  accentColor: "#C8743A",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/paper-boats.wav", trackId: "paper-boats", title: "Paper Boats", startAt: 0 },
  video: undefined,
  countdown: undefined,
  surprise: undefined,
};

export const demoData: Record<"en" | "es", GiftData<FortuneFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Eight cookies, one real one",
    message: "The fortunes were jokes. Mostly. This one isn't.\n\n**You are the best thing that has ever happened to my Tuesdays.** And the other days. All of them.\n\n*Lucky numbers: the date you said yes to coffee.*",
    photos: demoPhotos(["p1", "p4", "p3"], { p1: "Exhibit A", p4: "The tiebreaker", p3: "Evidence of cake" }),
    fields: {
      table: "red",
      luckyNumbers: "14 · 06 · 21 · 7 · 30",
      fortunes: [
        "You will be tackled by a small dog before noon. Accept it.",
        "A window seat is in your future. Someone will give it up for you.",
        "Your sugar is safe with no one.",
        "You will cry at an advert this week. It will be about a lighthouse.",
        "An unexpected visitor brings pasta. Do not argue about the pasta.",
        "You will get lost in a foreign city on purpose. It will be the best night of the year.",
        "The person who wrote this cookie loves you. Suspiciously accurate.",
      ],
    },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Ocho galletas, una de verdad",
    message: "Las fortunas eran bromas. Casi todas. Esta no.\n\n**Eres lo mejor que le ha pasado nunca a mis martes.** Y a los demás días. A todos.\n\n*Números de la suerte: la fecha en que dijiste que sí a un café.*",
    photos: demoPhotos(["p1", "p4", "p3"], { p1: "Prueba A", p4: "El desempate", p3: "Pruebas de tarta" }),
    fields: {
      table: "red",
      luckyNumbers: "14 · 06 · 21 · 7 · 30",
      fortunes: [
        "Un perro pequeño te derribará antes del mediodía. Acéptalo.",
        "Hay un asiento de ventana en tu futuro. Alguien te lo cederá.",
        "Tu azúcar no está a salvo con nadie.",
        "Llorarás con un anuncio esta semana. Saldrá un faro.",
        "Una visita inesperada trae pasta. No discutas sobre la pasta.",
        "Te perderás en una ciudad extranjera a propósito. Será la mejor noche del año.",
        "Quien escribió esta galleta te quiere. Sospechosamente acertado.",
      ],
    },
  },
};
