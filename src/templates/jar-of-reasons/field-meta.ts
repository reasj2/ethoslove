import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    reasons: { label: "Reasons", help: "One per line. At least three; a hundred is the classic. Photos attach to the first notes in order." },
    label: { label: "Jar label", help: "Defaults to “{n} reasons I love you”." },
    paper: { label: "Note paper", options: { white: "White", kraft: "Kraft", pastel: "Pastel mix" } },
  },
  es: {
    reasons: { label: "Razones", help: "Una por línea. Al menos tres; cien es el clásico. Las fotos se unen a las primeras notas, en orden." },
    label: { label: "Etiqueta del frasco", help: "Por defecto: «{n} razones por las que te quiero»." },
    paper: { label: "Papel de las notas", options: { white: "Blanco", kraft: "Kraft", pastel: "Mezcla pastel" } },
  },
};
