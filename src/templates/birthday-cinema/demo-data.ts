import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { CinemaFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "birthday-cinema",
  recipientName: "Ana",
  senderName: "Everyone",
  messageStyle: "typewriter" as const,
  accentColor: "#E8604C",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/golden-hour.wav", trackId: "golden-hour", title: "Golden Hour", startAt: 0 },
  video: undefined,
  countdown: undefined,
};

export const demoData: Record<"en" | "es", GiftData<CinemaFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Ana turns 30",
    message: "Thirty. You said you'd be terrified and instead you booked a flight, adopted a dog and learned to make pasta from scratch. **That's the whole review.**\n\nWe got you a cake, a small orchestra of people who love you, and this. *Make a wish — a real one.*",
    photos: demoPhotos(["p3", "p4", "p7", "p2", "p1", "p8"], { p3: "The cake, before", p4: "Nube, the birthday guest", p7: "Summer, on two wheels", p2: "Lisbon, obviously", p1: "Coffee number one thousand", p8: "The notes you leave" }),
    surprise: { text: "Check your coat pocket at midnight. Tickets. Two of them. Don't ask where.", reveal: "tap" },
    fields: { age: 30, curtain: "crimson", blow: "auto" },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Ana cumple 30",
    message: "Treinta. Dijiste que te daría pánico y en vez de eso reservaste un vuelo, adoptaste un perro y aprendiste a hacer pasta desde cero. **Esa es toda la reseña.**\n\nTe hemos traído una tarta, una pequeña orquesta de gente que te quiere, y esto. *Pide un deseo, uno de verdad.*",
    photos: demoPhotos(["p3", "p4", "p7", "p2", "p1", "p8"], { p3: "La tarta, antes", p4: "Nube, la invitada", p7: "Verano, sobre dos ruedas", p2: "Lisboa, obviamente", p1: "El café número mil", p8: "Las notas que dejas" }),
    surprise: { text: "Mira en el bolsillo del abrigo a medianoche. Entradas. Dos. No preguntes adónde.", reveal: "tap" },
    fields: { age: 30, curtain: "crimson", blow: "auto" },
  },
};
