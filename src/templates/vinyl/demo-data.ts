import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { VinylFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "vinyl",
  recipientName: "Sofía",
  senderName: "Lucas",
  messageStyle: "typewriter" as const,
  accentColor: "#C8743A",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/golden-hour.wav", trackId: "golden-hour", title: "Golden Hour", startAt: 0 },
  video: undefined,
  countdown: undefined,
  surprise: undefined,
};

export const demoData: Record<"en" | "es", GiftData<VinylFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Songs for the 23:40",
    message: "Track one is the one you played in the car when you thought I was asleep. I wasn't.\n\n**Every cover in the crate is a place we heard it.** Flip through. Play it loud.\n\n*Side B is the next ten years.*",
    photos: demoPhotos(["p6", "p2", "p7", "p5", "p1", "p3"], { p6: "The 23:40 to you", p2: "Lisbon, at full volume", p7: "July, windows down", p5: "Where there was no signal", p1: "Coffee number one", p3: "The candles, before" }),
    fields: { sleeve: "cream", side: "Side A", artist: "Lucas", album: "Songs for the 23:40" },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Canciones para el de las 23:40",
    message: "La primera es la que pusiste en el coche cuando creías que estaba dormida. No lo estaba.\n\n**Cada portada de la caja es un sitio donde la escuchamos.** Ve pasándolas. Ponla alta.\n\n*La cara B son los próximos diez años.*",
    photos: demoPhotos(["p6", "p2", "p7", "p5", "p1", "p3"], { p6: "El de las 23:40 hacia ti", p2: "Lisboa, a todo volumen", p7: "Julio, con las ventanillas bajadas", p5: "Donde no había cobertura", p1: "El primer café", p3: "Las velas, antes" }),
    fields: { sleeve: "cream", side: "Cara A", artist: "Lucas", album: "Canciones para el de las 23:40" },
  },
};
