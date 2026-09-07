import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    reasons: { label: "Reasons", help: "At least three; a hundred is the classic. Photos attach to the first notes in order.", addLabel: "Add a reason", placeholder: "You laugh at my worst jokes." },
    label: { label: "Jar label", help: "Defaults to “{n} reasons I love you”." },
    paper: { label: "Note paper", options: { white: "White", kraft: "Kraft", pastel: "Pastel mix" } },
  },
  es: {
    reasons: { label: "Razones", help: "Al menos tres; cien es el clásico. Las fotos se unen a las primeras notas, en orden.", addLabel: "Añadir una razón", placeholder: "Te ríes de mis peores chistes." },
    label: { label: "Etiqueta del frasco", help: "Por defecto: «{n} razones por las que te quiero»." },
    paper: { label: "Papel de las notas", options: { white: "Blanco", kraft: "Kraft", pastel: "Mezcla pastel" } },
  },
};
