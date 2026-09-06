import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    age: { label: "Age (number of candles)", help: "Up to 12 candles are drawn; bigger numbers become number candles." },
    marquee: { label: "Marquee line", help: "Defaults to “Now showing: {name} turns {age}”." },
    curtain: { label: "Curtain colour", options: { crimson: "Crimson velvet", midnight: "Midnight blue", emerald: "Emerald" } },
    blow: { label: "Blowing out the candles", options: { auto: "Microphone, swipe as backup", swipe: "Swipe only" } },
  },
  es: {
    age: { label: "Edad (número de velas)", help: "Se dibujan hasta 12 velas; los números mayores se convierten en velas numéricas." },
    marquee: { label: "Texto de la marquesina", help: "Por defecto: «Hoy: {nombre} cumple {edad}»." },
    curtain: { label: "Color del telón", options: { crimson: "Terciopelo carmesí", midnight: "Azul medianoche", emerald: "Esmeralda" } },
    blow: { label: "Apagar las velas", options: { auto: "Micrófono, deslizar como alternativa", swipe: "Solo deslizar" } },
  },
};
