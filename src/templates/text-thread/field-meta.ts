import type { FieldMeta } from "../types";

export const fieldMeta: Record<"en" | "es", Record<string, FieldMeta>> = {
  en: {
    lines: { label: "Messages", help: "In order, top to bottom. A message that only says “[photo]” drops in the next photo. Keep them short, it's a chat.", addLabel: "Add a message", placeholder: "you up?" },
    contactName: { label: "Your name in the chat header", help: "Defaults to your name." },
    bubble: { label: "Bubble colour", options: { ink: "Ink", blue: "Blue", green: "Green", coral: "Coral" } },
    showTyping: { label: "Show typing dots between messages" },
  },
  es: {
    lines: { label: "Mensajes", help: "En orden, de arriba abajo. Un mensaje que solo diga «[photo]» mete la siguiente foto. Cortos: es un chat.", addLabel: "Añadir un mensaje", placeholder: "¿estás despierta?" },
    contactName: { label: "Tu nombre en la cabecera del chat", help: "Por defecto, tu nombre." },
    bubble: { label: "Color de las burbujas", options: { ink: "Tinta", blue: "Azul", green: "Verde", coral: "Coral" } },
    showTyping: { label: "Mostrar los puntos de «escribiendo»" },
  },
};
