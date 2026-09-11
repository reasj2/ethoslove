import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    stems: { label: "Flowers", help: "Tap a flower to add a stem, then pick its colour. Up to 24 stems." },
    wrap: { label: "Paper", options: { kraft: "Kraft", tissue: "Tissue", blush: "Blush", noir: "Noir" } },
    ribbon: { label: "Ribbon", options: { cream: "Cream satin", red: "Red", sage: "Sage", black: "Black", pink: "Pink" } },
    backdrop: { label: "Background", options: { linen: "Linen", sage: "Sage", blush: "Blush", night: "Night" } },
    seed: { label: "Arrangement", help: "Shuffle until it looks right. They see exactly this one." },
    cardNote: { label: "The little card", help: "The words on the card tucked in the bouquet. Leave it empty for “For” and their name." },
  },
  es: {
    stems: { label: "Flores", help: "Toca una flor para añadir un tallo y elige su color. Hasta 24 tallos." },
    wrap: { label: "Papel", options: { kraft: "Kraft", tissue: "Seda", blush: "Rosa palo", noir: "Negro" } },
    ribbon: { label: "Lazo", options: { cream: "Raso crema", red: "Rojo", sage: "Salvia", black: "Negro", pink: "Rosa" } },
    backdrop: { label: "Fondo", options: { linen: "Lino", sage: "Salvia", blush: "Rosa", night: "Noche" } },
    seed: { label: "Composición", help: "Mézclalo hasta que te guste. Verán exactamente este." },
    cardNote: { label: "La tarjeta", help: "Lo que dice la tarjeta del ramo. Déjalo vacío para «Para» y su nombre." },
  },
};
