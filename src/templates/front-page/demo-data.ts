import type { GiftData } from "@/lib/gift/schema";
import { demoPhotos } from "../_shared/demo-photos";
import type { FrontPageFields } from "./schema";

const shared = {
  version: 1 as const,
  templateSlug: "front-page",
  recipientName: "Ana",
  senderName: "The Editorial Board",
  messageStyle: "fade" as const,
  accentColor: "#B23A2E",
  fontPairing: "editorial" as const,
  showReactionCta: true,
  watermark: false,
  music: undefined,
  video: undefined,
  countdown: undefined,
  surprise: { text: "The party is Saturday. You were told it's Sunday. Everyone is in on it. Act surprised.", reveal: "tap" as const },
};

export const demoData: Record<"en" | "es", GiftData<FrontPageFields>> = {
  en: {
    ...shared,
    locale: "en",
    title: "Local woman turns 30, nation reacts",
    message: "Sources close to the subject confirm that Ana, 30, has spent the last decade being “annoyingly good at everything” while insisting she is “barely holding it together.” Witnesses describe a person who remembers everyone's birthday, cries at dog adoption videos, and has never once arrived anywhere without snacks.\n\n**“She said she'd hate thirty,”** one friend told this paper. **“Then she booked a flight and adopted a dog.”** At press time the dog, Nube, declined to comment but was seen wagging.\n\nThe board wishes to state, for the record: *we love you. Happy birthday.*",
    photos: demoPhotos(["p3", "p4", "p7", "p2"], { p3: "The cake, moments before impact. Photo: staff", p4: "Nube, 2, pictured refusing to comment.", p7: "Summer holidays: 'nobody wore a helmet'", p2: "Lisbon, where the subject 'got lost on purpose'" }),
    fields: {
      paperName: "The Daily Ana",
      headline: "LOCAL WOMAN TURNS 30, NATION REACTS",
      subhead: "Friends describe scenes of “chaos, snacks, and at least one dog”",
      weather: "Sunny, with a 100% chance of cake.",
      ads: ["FOR SALE: One (1) slightly used snore machine. Free to a good home. Ask for Marco.", "LOST: Ana's sunglasses. Again. Reward: a coffee.", "WANTED: Someone to explain the plot of that film she cried at. Serious enquiries only.", "SEEKING: Window seat. Will trade aisle + lifelong devotion."],
      horoscope: "Pisces: A large sum of affection is coming your way. Avoid arguments about pasta.",
      price: "Priceless",
      ink: "black",
    },
  },
  es: {
    ...shared,
    senderName: "El Consejo Editorial",
    locale: "es",
    title: "Mujer local cumple 30; el país reacciona",
    message: "Fuentes cercanas confirman que Ana, 30, ha pasado la última década siendo «irritantemente buena en todo» mientras insiste en que «apenas lo lleva». Los testigos describen a una persona que se acuerda del cumpleaños de todo el mundo, llora con vídeos de adopciones de perros y jamás ha llegado a ningún sitio sin snacks.\n\n**«Dijo que odiaría los treinta»,** declaró una amiga a este periódico. **«Luego reservó un vuelo y adoptó un perro».** Al cierre de esta edición, la perra, Nube, declinó hacer declaraciones, pero se la vio mover la cola.\n\nEl consejo desea dejar constancia: *te queremos. Feliz cumpleaños.*",
    photos: demoPhotos(["p3", "p4", "p7", "p2"], { p3: "La tarta, instantes antes del impacto. Foto: redacción", p4: "Nube, 2, declinando hacer declaraciones.", p7: "Vacaciones de verano: «nadie llevaba casco»", p2: "Lisboa, donde la protagonista «se perdió a propósito»" }),
    fields: {
      paperName: "El Diario de Ana",
      headline: "MUJER LOCAL CUMPLE 30; EL PAÍS REACCIONA",
      subhead: "Sus amigos describen escenas de «caos, snacks y al menos un perro»",
      weather: "Soleado, con un 100 % de probabilidad de tarta.",
      ads: ["SE VENDE: Máquina de roncar, poco uso. Gratis a buen hogar. Preguntar por Marco.", "PERDIDAS: Las gafas de sol de Ana. Otra vez. Recompensa: un café.", "SE BUSCA: Alguien que explique la trama de esa película con la que lloró. Solo gente seria.", "SE OFRECE: Asiento de pasillo. Se cambia por ventana + devoción eterna."],
      horoscope: "Piscis: Te llega una gran suma de cariño. Evita discusiones sobre pasta.",
      price: "No tiene precio",
      ink: "black",
    },
  },
};
