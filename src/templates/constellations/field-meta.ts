import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    sky: { label: "Sky", options: { midnight: "Midnight", aurora: "Aurora", dawn: "Dawn" } },
    shape: { label: "Constellation shape", options: { heart: "Heart", infinity: "Infinity", star: "Star" } },
    finalLine: { label: "Line when the constellation completes", help: "Leave empty for the default." },
  },
  es: {
    sky: { label: "Cielo", options: { midnight: "Medianoche", aurora: "Aurora", dawn: "Amanecer" } },
    shape: { label: "Forma de la constelación", options: { heart: "Corazón", infinity: "Infinito", star: "Estrella" } },
    finalLine: { label: "Frase al completar la constelación", help: "Déjala vacía para usar la frase por defecto." },
  },
};
