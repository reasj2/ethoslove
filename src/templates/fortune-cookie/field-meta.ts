import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    fortunes: { label: "Fortunes", help: "3 to 20. Mix jokes with real ones. Photos attach to the first slips in order.", addLabel: "Add a fortune", placeholder: "You will be asked to share your fries. Say yes." },
    luckyNumbers: { label: "Lucky numbers", help: "Their birthday, your anniversary, the flat number… e.g. “14 · 06 · 21”" },
    table: { label: "Table", options: { red: "Red lacquer", jade: "Jade", linen: "Linen" } },
  },
  es: {
    fortunes: { label: "Fortunas", help: "De 3 a 20. Mezcla bromas con algunas de verdad. Las fotos se unen a las primeras tiras, en orden.", addLabel: "Añadir una fortuna", placeholder: "Te pedirán patatas. Di que sí." },
    luckyNumbers: { label: "Números de la suerte", help: "Su cumpleaños, vuestro aniversario, el número del piso… p. ej. «14 · 06 · 21»" },
    table: { label: "Mesa", options: { red: "Laca roja", jade: "Jade", linen: "Lino" } },
  },
};
