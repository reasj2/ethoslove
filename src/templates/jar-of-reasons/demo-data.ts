import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { JarFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "jar-of-reasons",
  recipientName: "Ana",
  senderName: "Marco",
  messageStyle: "typewriter" as const,
  accentColor: "#2F6B4F",
  fontPairing: "handwritten" as const,
  showReactionCta: true,
  watermark: false,
  music: { source: "library" as const, url: "/audio/library/paper-boats.wav", trackId: "paper-boats", title: "Paper Boats", startAt: 0 },
  video: undefined,
  countdown: undefined,
  surprise: undefined,
};

export const demoData: Record<"en" | "es", GiftData<JarFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Twelve reasons (to start)",
    message: "I ran out of jar before I ran out of reasons. **Consider this the first batch.**\n\nThe rest I'll keep telling you in person, one at a time, for as long as you'll let me.",
    photos: demoPhotos(["p1", "p2", "p8", "p4"], { p1: "Reason one, documented", p2: "The night we got lost", p8: "Exhibit B", p4: "The tiebreaker" }),
    fields: {
      paper: "pastel",
      reasons: [
        "You steal my sugar and deny it every time.",
        "You got us lost in Lisbon on purpose and it was the best night of that year.",
        "You leave notes in my books. I've kept every single one.",
        "You said yes to the dog before I finished the sentence.",
        "You hum when you cook and pretend you don't.",
        "You always give me the window seat.",
        "You remember my mother's birthday better than I do.",
        "You cry at adverts and then deny that too.",
        "You make a plan for the plan.",
        "You dance in the kitchen when you think the blinds are closed. They're not.",
        "You ask the waiter's name.",
        "You are the seat next to me, and it is never taken.",
      ],
    },
  },
  es: {
    ...shared,
    locale: "es",
    title: "Doce razones (para empezar)",
    message: "Se me acabó el frasco antes que las razones. **Considera esto la primera tanda.**\n\nEl resto te las seguiré contando en persona, de una en una, mientras me dejes.",
    photos: demoPhotos(["p1", "p2", "p8", "p4"], { p1: "Razón uno, documentada", p2: "La noche que nos perdimos", p8: "Prueba B", p4: "El desempate" }),
    fields: {
      paper: "pastel",
      reasons: [
        "Me robas el azúcar y lo niegas cada vez.",
        "Nos perdiste en Lisboa a propósito y fue la mejor noche de ese año.",
        "Dejas notas en mis libros. He guardado todas.",
        "Dijiste que sí al perro antes de que terminara la frase.",
        "Tarareas cuando cocinas y finges que no.",
        "Siempre me das el asiento de la ventana.",
        "Te acuerdas del cumpleaños de mi madre mejor que yo.",
        "Lloras con los anuncios y también lo niegas.",
        "Haces un plan para el plan.",
        "Bailas en la cocina cuando crees que la persiana está bajada. No lo está.",
        "Le preguntas el nombre al camarero.",
        "Eres el asiento de al lado, y nunca está ocupado.",
      ],
    },
  },
};
