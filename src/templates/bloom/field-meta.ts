import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    flower: { label: "Flower", options: { peony: "Peony", tulip: "Tulip", daisy: "Daisy" } },
    petalColor: { label: "Petal colour", help: "Leave empty to use the accent colour." },
    sky: { label: "Light", options: { dawn: "Dawn", dusk: "Dusk", paper: "Paper white" } },
    pollen: { label: "Pollen drifting in the light" },
  },
  es: {
    flower: { label: "Flor", options: { peony: "Peonía", tulip: "Tulipán", daisy: "Margarita" } },
    petalColor: {
      label: "Color de los pétalos",
      help: "Déjalo vacío para usar el color de acento.",
    },
    sky: { label: "Luz", options: { dawn: "Amanecer", dusk: "Atardecer", paper: "Blanco papel" } },
    pollen: { label: "Polen flotando en la luz" },
  },
};
