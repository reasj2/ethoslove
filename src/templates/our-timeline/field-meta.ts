import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    dates: { label: "Milestone dates", help: "In the same order as your photos.", addLabel: "Add a date", placeholder: "June 2021" },
    road: { label: "Road style", options: { asphalt: "Asphalt", chalk: "Chalk", ink: "Ink line" } },
    ending: { label: "Closing line", help: "Defaults to “…and it's only the beginning.”" },
  },
  es: {
    dates: { label: "Fechas de los hitos", help: "En el mismo orden que tus fotos.", addLabel: "Añadir una fecha", placeholder: "Junio 2021" },
    road: { label: "Estilo del camino", options: { asphalt: "Asfalto", chalk: "Tiza", ink: "Trazo de tinta" } },
    ending: { label: "Frase final", help: "Por defecto: «…y esto solo es el principio.»" },
  },
};
