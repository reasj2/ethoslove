import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    album: { label: "Album title", help: "Printed on the record label. Defaults to your gift title." },
    artist: { label: "Artist", help: "Defaults to your name." },
    sleeve: { label: "Sleeve", options: { black: "Black", cream: "Cream", burgundy: "Burgundy" } },
    side: { label: "Side label" },
  },
  es: {
    album: { label: "Título del disco", help: "Impreso en la etiqueta. Por defecto, el título del regalo." },
    artist: { label: "Artista", help: "Por defecto, tu nombre." },
    sleeve: { label: "Funda", options: { black: "Negra", cream: "Crema", burgundy: "Burdeos" } },
    side: { label: "Etiqueta de la cara" },
  },
};
