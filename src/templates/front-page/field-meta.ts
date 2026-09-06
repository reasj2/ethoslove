import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    paperName: { label: "Newspaper name", help: "Defaults to “The Daily {name}”." },
    headline: { label: "Headline", help: "Big and dramatic. Defaults to your gift title." },
    subhead: { label: "Sub-headline" },
    weather: { label: "Weather box", help: "Defaults to “Sunny, with a 100% chance of cake.”" },
    ads: { label: "Classified ads", help: "One per line. “FOR SALE: one slightly used snore machine. Free to a good home.”" },
    horoscope: { label: "Horoscope", help: "Something suspiciously specific." },
    price: { label: "Price on the masthead", help: "e.g. “Priceless”" },
    ink: { label: "Ink", options: { black: "Black", navy: "Navy", sepia: "Sepia" } },
  },
  es: {
    paperName: { label: "Nombre del periódico", help: "Por defecto: «El Diario de {nombre}»." },
    headline: { label: "Titular", help: "Grande y dramático. Por defecto, el título del regalo." },
    subhead: { label: "Subtítulo" },
    weather: { label: "El tiempo", help: "Por defecto: «Soleado, con un 100 % de probabilidad de tarta.»" },
    ads: { label: "Anuncios clasificados", help: "Uno por línea. «SE VENDE: máquina de roncar, poco uso. Gratis a buen hogar.»" },
    horoscope: { label: "Horóscopo", help: "Algo sospechosamente concreto." },
    price: { label: "Precio en la cabecera", help: "p. ej. «No tiene precio»" },
    ink: { label: "Tinta", options: { black: "Negra", navy: "Azul marino", sepia: "Sepia" } },
  },
};
