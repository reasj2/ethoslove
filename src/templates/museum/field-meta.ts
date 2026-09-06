import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    wall: { label: "Wall", options: { plaster: "Warm plaster", charcoal: "Charcoal", sage: "Sage" } },
    exhibition: { label: "Exhibition title", help: "On the entrance placard. Defaults to your gift title." },
    years: { label: "Years on the plaques", help: "e.g. “2021–2026”" },
    frame: { label: "Frames", options: { oak: "Oak", black: "Black", gilt: "Gilt" } },
  },
  es: {
    wall: { label: "Pared", options: { plaster: "Yeso cálido", charcoal: "Carbón", sage: "Salvia" } },
    exhibition: { label: "Título de la exposición", help: "En el cartel de entrada. Por defecto, el título del regalo." },
    years: { label: "Años en las placas", help: "p. ej. «2021–2026»" },
    frame: { label: "Marcos", options: { oak: "Roble", black: "Negro", gilt: "Dorado" } },
  },
};
