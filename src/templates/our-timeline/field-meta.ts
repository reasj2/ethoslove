import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    dates: { label: "Milestone dates", help: "One per line, in the same order as your photos: “June 2021”, “Winter 2022”…" },
    road: { label: "Road style", options: { asphalt: "Asphalt", chalk: "Chalk", ink: "Ink line" } },
    ending: { label: "Closing line", help: "Defaults to “…and it's only the beginning.”" },
  },
  es: {
    dates: { label: "Fechas de los hitos", help: "Una por línea, en el mismo orden que tus fotos: «Junio 2021», «Invierno 2022»…" },
    road: { label: "Estilo del camino", options: { asphalt: "Asfalto", chalk: "Tiza", ink: "Trazo de tinta" } },
    ending: { label: "Frase final", help: "Por defecto: «…y esto solo es el principio.»" },
  },
};
