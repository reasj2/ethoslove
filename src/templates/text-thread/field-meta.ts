import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    lines: { label: "Messages", help: "One per line, in order. Write “[photo]” on its own line to drop in the next photo. Keep them short — it's a chat." },
    contactName: { label: "Your name in the chat header", help: "Defaults to your name." },
    bubble: { label: "Bubble colour", options: { ink: "Ink", blue: "Blue", green: "Green", coral: "Coral" } },
    showTyping: { label: "Show typing dots between messages" },
  },
  es: {
    lines: { label: "Mensajes", help: "Uno por línea, en orden. Escribe «[photo]» en una línea sola para meter la siguiente foto. Cortos: es un chat." },
    contactName: { label: "Tu nombre en la cabecera del chat", help: "Por defecto, tu nombre." },
    bubble: { label: "Color de las burbujas", options: { ink: "Tinta", blue: "Azul", green: "Verde", coral: "Coral" } },
    showTyping: { label: "Mostrar los puntos de «escribiendo»" },
  },
};
