import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    item: { label: "What falls", options: { heart: "Hearts", star: "Stars", cake: "Cake slices" } },
    perLevel: { label: "Catches per level", help: "8 feels right. Lower for grandparents, higher for gamers." },
    crt: { label: "CRT scanlines on by default" },
    title: { label: "Game title", help: "Defaults to “{name} QUEST”." },
  },
  es: {
    item: { label: "Qué cae", options: { heart: "Corazones", star: "Estrellas", cake: "Trozos de tarta" } },
    perLevel: { label: "Capturas por nivel", help: "8 va bien. Menos para los abuelos, más para gamers." },
    crt: { label: "Líneas CRT activadas por defecto" },
    title: { label: "Título del juego", help: "Por defecto: «{nombre} QUEST»." },
  },
};
