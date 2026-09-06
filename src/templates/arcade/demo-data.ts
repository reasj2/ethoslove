import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { ArcadeFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "arcade",
  recipientName: "Ana",
  senderName: "Marco",
  messageStyle: "typewriter" as const,
  accentColor: "#E8604C",
  fontPairing: "modern" as const,
  showReactionCta: true,
  watermark: false,
  music: undefined,
  video: undefined,
  countdown: undefined,
  surprise: { text: "CHEAT CODE: say “window seat” at the airport on the 20th. Something happens.", reveal: "tap" as const },
};

export const demoData: Record<"en" | "es", GiftData<ArcadeFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "ANA QUEST",
    message: "LEVEL COMPLETE.\n\nYou caught every heart I threw, which is roughly how the last three years went. **High score: you.**\n\n*Insert coin to continue. (The coin is a kiss. I don't make the rules.)*",
    photos: demoPhotos(["p1", "p2", "p4", "p7"], { p1: "LEVEL 1 · THE COFFEE", p2: "LEVEL 2 · LISBON", p4: "LEVEL 3 · NUBE JOINS THE PARTY", p7: "LEVEL 4 · SUMMER SPEEDRUN" }),
    fields: { item: "heart", perLevel: 8, crt: true, title: "ANA QUEST" },
  },
  es: {
    ...shared,
    locale: "es",
    title: "ANA QUEST",
    message: "NIVEL COMPLETADO.\n\nAtrapaste todos los corazones que te lancé, que es más o menos cómo fueron los últimos tres años. **Récord: tú.**\n\n*Inserta moneda para continuar. (La moneda es un beso. Yo no pongo las reglas.)*",
    photos: demoPhotos(["p1", "p2", "p4", "p7"], { p1: "NIVEL 1 · EL CAFÉ", p2: "NIVEL 2 · LISBOA", p4: "NIVEL 3 · NUBE SE UNE", p7: "NIVEL 4 · SPEEDRUN DE VERANO" }),
    fields: { item: "heart", perLevel: 8, crt: true, title: "ANA QUEST" },
  },
};
