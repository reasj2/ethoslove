import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    fortunes: { label: "Fortunes", help: "One per line, 3 to 20. Mix jokes with real ones. Photos attach to the first slips in order." },
    luckyNumbers: { label: "Lucky numbers", help: "Their birthday, your anniversary, the flat number… e.g. “14 · 06 · 21”" },
    table: { label: "Table", options: { red: "Red lacquer", jade: "Jade", linen: "Linen" } },
  },
  es: {
    fortunes: { label: "Fortunas", help: "Una por línea, de 3 a 20. Mezcla bromas con algunas de verdad. Las fotos se unen a las primeras tiras, en orden." },
    luckyNumbers: { label: "Números de la suerte", help: "Su cumpleaños, vuestro aniversario, el número del piso… p. ej. «14 · 06 · 21»" },
    table: { label: "Mesa", options: { red: "Laca roja", jade: "Jade", linen: "Lino" } },
  },
};
