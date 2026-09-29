export const pageSlugs = ["bodas", "eventos", "personalizados"] as const;
export type PageSlug = typeof pageSlugs[number];
export type PageImage = { id: string; url: string; provider?: string; providerId?: string; assetId?: string };
export const pageFeatureIconOptions = [
  { value: "bouquet", label: "Ramo" },
  { value: "arch", label: "Arco de ceremonia" },
  { value: "table", label: "Mesa" },
  { value: "gift", label: "Regalo" },
  { value: "stem", label: "Rama floral" },
  { value: "flower", label: "Flor" },
  { value: "chocolate", label: "Chocolate" },
  { value: "bear", label: "Peluches" },
  { value: "card", label: "Tarjeta" },
] as const;
export type PageFeatureIcon = typeof pageFeatureIconOptions[number]["value"];
export type PageFeature = { titleEs: string; titleEn: string; descriptionEs: string; descriptionEn: string; icon: PageFeatureIcon };
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
  heroAsideEs: string;
  heroAsideEn: string;
  detailKickerEs: string;
  detailKickerEn: string;
  secondaryCtaLabelEs: string;
  secondaryCtaLabelEn: string;
  features: PageFeature[];
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
    heroAsideEs: "Tu historia, en flor.",
    heroAsideEn: "Your story, in bloom.",
    detailKickerEs: "Una propuesta creada para ustedes",
    detailKickerEn: "A proposal created for you",
    secondaryCtaLabelEs: "Conocer nuestro enfoque",
    secondaryCtaLabelEn: "Explore our approach",
    features: [
      { titleEs: "Ramo y flores personales", titleEn: "Bouquet and personal flowers", descriptionEs: "Piezas pensadas para acompañar cada momento.", descriptionEn: "Pieces designed to accompany every moment.", icon: "bouquet" },
      { titleEs: "Flores de ceremonia", titleEn: "Ceremony florals", descriptionEs: "Diseño para un sí que se siente propio.", descriptionEn: "Design for a yes that feels like yours.", icon: "arch" },
      { titleEs: "Ambientación de recepción", titleEn: "Reception styling", descriptionEs: "Detalles que unen el espacio y la celebración.", descriptionEn: "Details that bring the space and celebration together.", icon: "table" },
    ],
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
    heroAsideEs: "Momentos hechos para compartir.",
    heroAsideEn: "Moments made to share.",
    detailKickerEs: "Todo parte de una intención",
    detailKickerEn: "Everything starts with an intention",
    secondaryCtaLabelEs: "Ver cómo trabajamos",
    secondaryCtaLabelEn: "See how we work",
    features: [
      { titleEs: "Celebraciones", titleEn: "Celebrations", descriptionEs: "Arreglos para los momentos que quieres recordar.", descriptionEn: "Arrangements for the moments you want to remember.", icon: "gift" },
      { titleEs: "Encuentros", titleEn: "Gatherings", descriptionEs: "Flores que hacen sentir especial cada espacio.", descriptionEn: "Flowers that make every space feel special.", icon: "stem" },
      { titleEs: "Ambientación", titleEn: "Styling", descriptionEs: "Detalles florales para recibir y sorprender.", descriptionEn: "Floral details to welcome and delight.", icon: "flower" },
    ],
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
    heroAsideEs: "Detalles que hablan desde el corazón.",
    heroAsideEn: "Details that speak from the heart.",
    detailKickerEs: "Un detalle más",
    detailKickerEn: "One more detail",
    secondaryCtaLabelEs: "Ver opciones",
    secondaryCtaLabelEn: "Explore options",
    features: [
      { titleEs: "Chocolates", titleEn: "Chocolates", descriptionEs: "Un toque dulce para acompañar tus flores.", descriptionEn: "A sweet touch to pair with your flowers.", icon: "chocolate" },
      { titleEs: "Peluches", titleEn: "Teddy bears", descriptionEs: "Un detalle cálido para momentos especiales.", descriptionEn: "A warm detail for special moments.", icon: "bear" },
      { titleEs: "Tarjetas y detalles", titleEn: "Cards and details", descriptionEs: "Mensajes y acabados hechos para tu historia.", descriptionEn: "Messages and finishes made for your story.", icon: "card" },
    ],
  },
};

export function defaultPageContent(slug: string) {
  return defaults[pageSlugs.includes(slug as PageSlug) ? slug as PageSlug : "bodas"];
}

// Compatibilidad temporal para contenido de Bodas y Eventos guardado antes del editor de Páginas.
export type ServicePageContent = PageContent;
export function defaultServicePageContent(slug: string) { return defaultPageContent(slug); }
