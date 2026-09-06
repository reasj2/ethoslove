import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { MuseumFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "museum",
  recipientName: "Mamá",
  senderName: "Dani",
  messageStyle: "fade" as const,
  accentColor: "#8C7B6B",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/quiet-hours.mp3", trackId: "quiet-hours", title: "Quiet Hours", startAt: 0 },
  video: undefined,
  countdown: undefined,
  surprise: undefined,
};

export const demoData: Record<"en" | "es", GiftData<MuseumFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "A Retrospective",
    message: "Every museum I've ever dragged you through, you read every plaque. So here's one where you're the subject.\n\n**Thirty years of small, unpaid, unphotographed work.** This is the photographed part.\n\n*Curated with love, by the person who never says it enough.*",
    photos: demoPhotos(["p8", "p3", "p1", "p7", "p4", "p2"], { p8: "The Notes", p3: "Thirty Candles", p1: "Sunday, Coffee", p7: "The Summer of Bicycles", p4: "Portrait of Nube", p2: "Lisbon, Dusk" }),
    fields: { wall: "plaster", frame: "oak", exhibition: "A Retrospective", years: "1996–2026" },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Una retrospectiva",
    message: "En todos los museos por los que te he arrastrado, leíste cada placa. Así que aquí tienes uno donde el tema eres tú.\n\n**Treinta años de trabajo pequeño, sin sueldo y sin fotos.** Esta es la parte con fotos.\n\n*Comisariado con amor, por la persona que nunca lo dice lo suficiente.*",
    photos: demoPhotos(["p8", "p3", "p1", "p7", "p4", "p2"], { p8: "Las notas", p3: "Treinta velas", p1: "Domingo, café", p7: "El verano de las bicicletas", p4: "Retrato de Nube", p2: "Lisboa, atardecer" }),
    fields: { wall: "plaster", frame: "oak", exhibition: "Una retrospectiva", years: "1996–2026" },
  },
};
