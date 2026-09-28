export const pageSlugs = ["bodas", "eventos", "personalizados"] as const;
export type PageSlug = typeof pageSlugs[number];
export type PageImage = { id: string; url: string; provider?: string; providerId?: string; assetId?: string };
export type PageContent = {
  kickerEs: string;
  kickerEn: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  detailTitleEs: string;
  detailTitleEn: string;
  detailBodyOneEs: string;
  detailBodyOneEn: string;
  detailBodyTwoEs: string;
  detailBodyTwoEn: string;
  ctaLabelEs: string;
  ctaLabelEn: string;
  imageAltEs: string;
  imageAltEn: string;
};

const defaults: Record<PageSlug, PageContent> = {
  bodas: {
    kickerEs: "Bodas",
    kickerEn: "Weddings",
    titleEs: "Flores que acompañan el comienzo.",
    titleEn: "Flowers for a beautiful beginning.",
    descriptionEs: "Diseñamos bouquets, ceremonia y recepción como una sola historia visual.",
    descriptionEn: "We design bouquets, ceremony and reception as one visual story.",
    detailTitleEs: "Una propuesta creada para ustedes.",
    detailTitleEn: "A proposal created for you.",
    detailBodyOneEs: "Partimos del lugar, la temporada, la paleta y la emoción que quieren transmitir.",
    detailBodyOneEn: "We begin with the venue, season, palette and emotion you want to convey.",
    detailBodyTwoEs: "Incluye consulta inicial, concepto floral, selección de piezas y coordinación de montaje.",
    detailBodyTwoEn: "Includes an initial consultation, floral concept, piece selection and setup coordination.",
    ctaLabelEs: "Solicitar propuesta",
    ctaLabelEn: "Request a proposal",
    imageAltEs: "Ceremonia decorada con flores",
    imageAltEn: "Ceremony decorated with flowers",
  },
  eventos: {
    kickerEs: "Eventos",
    kickerEn: "Events",
    titleEs: "Ambientes que florecen contigo.",
    titleEn: "Spaces that bloom with you.",
    descriptionEs: "Cumpleaños, graduaciones, reuniones y celebraciones diseñadas según el espacio.",
    descriptionEn: "Birthdays, graduations, gatherings and celebrations designed for your space.",
    detailTitleEs: "Del detalle a la atmósfera completa.",
    detailTitleEn: "From one detail to the full atmosphere.",
    detailBodyOneEs: "Creamos centros de mesa, puntos focales y arreglos de bienvenida con una misma intención visual.",
    detailBodyOneEn: "We create centerpieces, focal points and welcome arrangements with one visual intention.",
    detailBodyTwoEs: "",
    detailBodyTwoEn: "",
    ctaLabelEs: "Cuéntanos sobre tu evento",
    ctaLabelEn: "Tell us about your event",
    imageAltEs: "Flores para celebración",
    imageAltEn: "Flowers for a celebration",
  },
  personalizados: {
    kickerEs: "Personalizados",
    kickerEn: "Personalized",
    titleEs: "Detalles hechos para tu historia.",
    titleEn: "Details made for your story.",
    descriptionEs: "Acompaña tus flores con piezas pensadas especialmente para esa persona.",
    descriptionEn: "Pair your flowers with pieces created especially for that person.",
    detailTitleEs: "Tu idea. Nuestra inspiración.",
    detailTitleEn: "Your idea. Our inspiration.",
    detailBodyOneEs: "Las flores llevan el mensaje. Un detalle personalizado puede hacerlo todavía más tuyo.",
    detailBodyOneEn: "Flowers carry the message. A personalized detail can make it even more yours.",
    detailBodyTwoEs: "",
    detailBodyTwoEn: "",
    ctaLabelEs: "Crear un regalo",
    ctaLabelEn: "Create a gift",
    imageAltEs: "Detalle floral en tonos rosados",
    imageAltEn: "Floral detail in blush tones",
  },
};

export function defaultPageContent(slug: string) {
  return defaults[pageSlugs.includes(slug as PageSlug) ? slug as PageSlug : "bodas"];
}

// Compatibilidad temporal para contenido de Bodas y Eventos guardado antes del editor de Páginas.
export type ServicePageContent = PageContent;
export function defaultServicePageContent(slug: string) { return defaultPageContent(slug); }
