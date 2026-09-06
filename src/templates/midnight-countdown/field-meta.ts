import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    skyline: { label: "Horizon", options: { city: "City skyline", sea: "Sea", mountains: "Mountains" } },
    headline: { label: "Headline above the timer", help: "Defaults to “Until midnight”. Set the date and time in Extras → Countdown." },
    zeroLine: { label: "Line at zero", help: "Defaults to “Happy birthday, {name}”." },
  },
  es: {
    skyline: { label: "Horizonte", options: { city: "Ciudad", sea: "Mar", mountains: "Montañas" } },
    headline: { label: "Titular sobre el reloj", help: "Por defecto: «Hasta medianoche». La fecha y hora se ponen en Extras → Cuenta atrás." },
    zeroLine: { label: "Frase a cero", help: "Por defecto: «Feliz cumpleaños, {nombre}»." },
  },
};
