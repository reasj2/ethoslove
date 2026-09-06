import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    foil: { label: "Foil", options: { silver: "Silver", gold: "Gold", rose: "Rose gold", holo: "Holographic" } },
    foilText: { label: "Text on the foil", help: "Defaults to “Scratch here”." },
    finalTitle: { label: "Final card headline", help: "The big line on the last card, e.g. “Will you marry me?”" },
  },
  es: {
    foil: { label: "Metalizado", options: { silver: "Plata", gold: "Oro", rose: "Oro rosa", holo: "Holográfico" } },
    foilText: { label: "Texto sobre el metalizado", help: "Por defecto: «Rasca aquí»." },
    finalTitle: { label: "Titular de la última tarjeta", help: "La frase grande de la última tarjeta, p. ej. «¿Te casas conmigo?»" },
  },
};
