import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export const legalPolicyKeys = ["privacy", "terms", "delivery", "cancellations", "floralSubstitution", "weddingsEvents", "accessibility"] as const;
export type LegalPolicyKey = typeof legalPolicyKeys[number];
export type LegalPolicy = {
  titleEs: string; titleEn: string; contentEs: string; contentEn: string;
  updatedAt: string; published: boolean;
};
export type SeoPolicies = {
  siteTitleEs: string; siteTitleEn: string; descriptionEs: string; descriptionEn: string;
  privacyEs: string; privacyEn: string; termsEs: string; termsEn: string;
  policies?: Partial<Record<LegalPolicyKey, Partial<LegalPolicy>>>;
};
export const defaultSeoPolicies: SeoPolicies = {
  siteTitleEs: "OrosBlooms | Flores y diseños para cada ocasión",
  siteTitleEn: "OrosBlooms | Luxury Flowers, Gift Boxes & Floral Designs",
  descriptionEs: "Arreglos florales, cajas de flores y regalos personalizados para cada ocasión.",
  descriptionEn: "Discover luxury flower arrangements, bloom boxes, and personalized gifts for every occasion. Thoughtfully designed by OrosBlooms.",
  privacyEs: "", privacyEn: "", termsEs: "", termsEn: "",
};

export const legalPolicyDefaults: Record<LegalPolicyKey, LegalPolicy> = {
  privacy: {
    titleEs: "Política de privacidad", titleEn: "Privacy Policy", updatedAt: "", published: true,
    contentEs: "Información que recibimos\nPara atender pedidos y solicitudes, OrosBlooms puede recibir nombre, correo electrónico, teléfono, dirección de entrega, información del pedido o solicitud y comprobantes de pago. El sitio también puede procesar información técnica y analítica básica relacionada con su uso.\n\nUso de la información\nUtilizamos estos datos para responder consultas, preparar cotizaciones, gestionar pedidos, coordinar entregas o retiros y verificar pagos.\n\nConservación y solicitudes de privacidad\nPlazo de conservación: [POR DEFINIR]. Contacto para consultas sobre tus datos: [POR DEFINIR].",
    contentEn: "Information we receive\nTo handle orders and requests, OrosBlooms may receive a name, email address, phone number, delivery address, order or request details, and payment proofs. The site may also process basic technical and analytics information related to its use.\n\nHow information is used\nWe use this information to respond to inquiries, prepare quotes, manage orders, coordinate delivery or pickup, and verify payments.\n\nRetention and privacy requests\nRetention period: [POR DEFINIR]. Contact for questions about your data: [POR DEFINIR].",
  },
  terms: {
    titleEs: "Términos y condiciones", titleEn: "Terms and Conditions", updatedAt: "", published: true,
    contentEs: "Uso del sitio y pedidos\nEl sitio permite explorar arreglos y solicitar pedidos. La disponibilidad de flores, complementos y fechas se confirma durante el proceso de pedido.\n\nPrecios y pagos\nLos precios, cargos aplicables y el total se muestran antes de confirmar el pedido. Condiciones de adelanto y saldo pendiente: [POR DEFINIR]. Cuando se usa Zelle, el pago ocurre mediante un servicio externo. Subir un comprobante no confirma por sí solo la recepción del dinero; OrosBlooms verifica el pago. Usa la referencia del pedido cuando corresponda.\n\nEntregas, retiro y sustituciones\nCondiciones de entrega y retiro: [POR DEFINIR]. Las flores son productos naturales y pueden requerirse sustituciones; consulta la Política de sustitución floral.\n\nCancelaciones y pedidos especiales\nPlazos, condiciones y reembolsos: [POR DEFINIR]. Condiciones de trabajos personalizados, bodas y eventos: [POR DEFINIR].",
    contentEn: "Site use and orders\nThe site lets customers explore arrangements and request orders. Flower, add-on, and date availability is confirmed during the ordering process.\n\nPrices and payments\nPrices, applicable charges, and the total are shown before order confirmation. Deposit and remaining-balance terms: [POR DEFINIR]. When Zelle is used, payment takes place through an external service. Uploading a payment proof does not by itself confirm receipt of funds; OrosBlooms verifies the payment. Use the order reference when applicable.\n\nDelivery, pickup, and substitutions\nDelivery and pickup terms: [POR DEFINIR]. Flowers are natural products and substitutions may be needed; see the Floral Substitution Policy.\n\nCancellations and special orders\nTimeframes, conditions, and refunds: [POR DEFINIR]. Terms for personalized work, weddings, and events: [POR DEFINIR].",
  },
  delivery: {
    titleEs: "Entregas y retiro", titleEn: "Delivery and Pickup", updatedAt: "", published: false,
    contentEs: "Zonas de entrega\nZonas disponibles: [POR DEFINIR].\n\nCostos y ventanas de entrega\nCosto y ventanas de entrega: [POR DEFINIR].\n\nRetiro\nLugar, horario y condiciones de retiro: [POR DEFINIR].\n\nDirección o destinatario\nProcedimiento para una dirección incorrecta o un destinatario no disponible: [POR DEFINIR].\n\nReintentos y pedidos urgentes\nCondiciones y costos de reintento: [POR DEFINIR]. Disponibilidad y condiciones de pedidos urgentes: [POR DEFINIR].",
    contentEn: "Delivery areas\nAvailable areas: [POR DEFINIR].\n\nCosts and delivery windows\nDelivery charges and windows: [POR DEFINIR].\n\nPickup\nPickup location, hours, and conditions: [POR DEFINIR].\n\nAddress or recipient\nProcess for an incorrect address or unavailable recipient: [POR DEFINIR].\n\nRedelivery and urgent orders\nRedelivery conditions and charges: [POR DEFINIR]. Availability and conditions for urgent orders: [POR DEFINIR].",
  },
  cancellations: {
    titleEs: "Cancelaciones y reembolsos", titleEn: "Cancellations and Refunds", updatedAt: "", published: false,
    contentEs: "Antes de la preparación\nPlazo y condiciones para cancelar antes de preparar un pedido: [POR DEFINIR].\n\nPedido preparado\nCondiciones aplicables una vez preparado el pedido: [POR DEFINIR].\n\nPedidos personalizados\nCondiciones de cancelación de trabajos personalizados: [POR DEFINIR].\n\nAdelantos y reembolsos\nTratamiento de adelantos, elegibilidad, método y plazo de reembolso: [POR DEFINIR].\n\nBodas y eventos\nCondiciones de cancelación y reembolso de bodas y eventos: [POR DEFINIR].",
    contentEn: "Before preparation\nTimeframe and conditions for cancellation before an order is prepared: [POR DEFINIR].\n\nPrepared orders\nConditions once an order has been prepared: [POR DEFINIR].\n\nPersonalized orders\nCancellation conditions for personalized work: [POR DEFINIR].\n\nDeposits and refunds\nTreatment of deposits, refund eligibility, method, and timing: [POR DEFINIR].\n\nWeddings and events\nCancellation and refund conditions for weddings and events: [POR DEFINIR].",
  },
  floralSubstitution: {
    titleEs: "Sustitución floral", titleEn: "Floral Substitution", updatedAt: "", published: false,
    contentEs: "Las flores son productos naturales. Sus colores, tamaños y variedades pueden variar, y la disponibilidad depende de la temporada y del proveedor. Las fotografías sirven como referencia del estilo general, no como garantía de que cada tallo será idéntico.\n\nCuando una flor o variedad no esté disponible, puede ser necesaria una sustitución. OrosBlooms buscará conservar el estilo, la paleta y el valor aproximado del diseño solicitado.",
    contentEn: "Flowers are natural products. Their colors, sizes, and varieties may vary, and availability depends on the season and supplier. Photographs illustrate the general style and do not guarantee that every stem will be identical.\n\nWhen a flower or variety is unavailable, a substitution may be necessary. OrosBlooms will seek to preserve the requested design's style, palette, and approximate value.",
  },
  weddingsEvents: {
    titleEs: "Bodas y eventos", titleEn: "Weddings and Events", updatedAt: "", published: false,
    contentEs: "Propuesta y cotización\nAlcance, piezas incluidas, precio y vigencia de la propuesta: [POR DEFINIR].\n\nReserva, adelanto y saldo\nCondiciones de reserva, adelanto y saldo pendiente: [POR DEFINIR].\n\nCambios y fecha\nProceso para cambios de alcance, diseño o fecha: [POR DEFINIR].\n\nCancelación\nPlazos, cargos y reembolsos: [POR DEFINIR].\n\nMontaje, desmontaje y acceso\nResponsabilidades, horarios y requisitos de acceso al lugar: [POR DEFINIR].",
    contentEn: "Proposal and quote\nScope, included pieces, price, and proposal validity: [POR DEFINIR].\n\nReservation, deposit, and balance\nReservation, deposit, and remaining-balance terms: [POR DEFINIR].\n\nChanges and date\nProcess for changes to scope, design, or date: [POR DEFINIR].\n\nCancellation\nTimeframes, charges, and refunds: [POR DEFINIR].\n\nSetup, removal, and venue access\nResponsibilities, schedules, and venue-access requirements: [POR DEFINIR].",
  },
  accessibility: {
    titleEs: "Accesibilidad", titleEn: "Accessibility", updatedAt: "", published: false,
    contentEs: "OrosBlooms procura ofrecer una experiencia digital que pueda ser utilizada por la mayor cantidad posible de personas. Seguimos trabajando para mejorar la claridad del contenido y la facilidad de navegación.\n\nSi encuentras una barrera de acceso o necesitas ayuda para consultar información o realizar un pedido, contáctanos en: [POR DEFINIR]. Describe la dificultad y la página donde ocurrió para que podamos atender tu solicitud.",
    contentEn: "OrosBlooms aims to offer a digital experience that can be used by as many people as possible. We continue working to improve content clarity and ease of navigation.\n\nIf you encounter an accessibility barrier or need help viewing information or placing an order, contact us at: [POR DEFINIR]. Please describe the difficulty and the page where it occurred so we can address your request.",
  },
};

export function resolveLegalPolicy(settings: SeoPolicies, key: LegalPolicyKey): LegalPolicy {
  const legacy = key === "privacy"
    ? { ...(settings.privacyEs ? { contentEs: settings.privacyEs } : {}), ...(settings.privacyEn ? { contentEn: settings.privacyEn } : {}) }
    : key === "terms"
      ? { ...(settings.termsEs ? { contentEs: settings.termsEs } : {}), ...(settings.termsEn ? { contentEn: settings.termsEn } : {}) }
      : {};
  const saved = settings.policies?.[key] ?? {};
  return { ...legalPolicyDefaults[key], ...legacy, ...saved } as LegalPolicy;
}

export const getSeoPolicies = cache(async (): Promise<SeoPolicies> => {
  const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "seo-policies")).limit(1);
  return { ...defaultSeoPolicies, ...(row?.value as Partial<SeoPolicies> | undefined) };
});
