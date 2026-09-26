import "server-only";
import { Resend } from "resend";

type InquiryEmail = {
  reference: string;
  name: string;
  email?: string;
  phone: string;
  type: string;
  occasion?: string;
  style?: string;
  colors?: string;
  budgetMin?: number;
  budgetMax?: number;
  requiredAt?: string;
  fulfillment: "delivery" | "pickup";
  notes?: string;
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const money = (value?: number) => value === undefined ? "—" : new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value);

function layout(title: string, content: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f2eb;font-family:Arial,sans-serif;color:#263228"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(title)}</div><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border:1px solid #e4ded2;border-radius:20px;overflow:hidden"><div style="padding:24px 28px;background:#263228;color:#fff"><div style="font-family:Georgia,serif;font-size:28px">OrosBlooms</div><div style="margin-top:4px;color:#dce3d8;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Flores para cada historia</div></div><div style="padding:28px">${content}</div></div><p style="margin:18px 0 0;text-align:center;color:#7b7d76;font-size:12px">Este mensaje fue enviado automáticamente por OrosBlooms.</p></div></body></html>`;
}

function row(label: string, value: unknown) {
  if (value === undefined || value === null || value === "") return "";
  return `<tr><td style="padding:9px 10px;color:#70756c;border-bottom:1px solid #eee9df;font-size:13px">${escapeHtml(label)}</td><td style="padding:9px 10px;border-bottom:1px solid #eee9df;font-size:14px">${escapeHtml(value)}</td></tr>`;
}

export async function sendInquiryEmails(inquiry: InquiryEmail) {
  if (process.env.EMAIL_TRANSPORT === "mock") return { sent: true as const, mocked: true as const };
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const internalRecipient = process.env.RESEND_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !internalRecipient) {
    if (process.env.NODE_ENV !== "test") console.warn("Resend no está configurado; se omitieron los correos de la solicitud.");
    return { sent: false as const, reason: "not-configured" as const };
  }

  const resend = new Resend(apiKey);
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/solicitudes`;
  const details = `<table style="width:100%;border-collapse:collapse;margin-top:18px">${row("Referencia", inquiry.reference)}${row("Cliente", inquiry.name)}${row("Correo", inquiry.email)}${row("Teléfono", inquiry.phone)}${row("Tipo", inquiry.type)}${row("Ocasión", inquiry.occasion)}${row("Estilo", inquiry.style)}${row("Colores", inquiry.colors)}${row("Presupuesto mínimo", money(inquiry.budgetMin))}${row("Presupuesto máximo", money(inquiry.budgetMax))}${row("Fecha requerida", inquiry.requiredAt)}${row("Modalidad", inquiry.fulfillment === "delivery" ? "Entrega" : "Retiro")}${row("Detalles", inquiry.notes)}</table>`;
  const messages = [resend.emails.send({
    from,
    to: [internalRecipient],
    replyTo: inquiry.email || undefined,
    subject: `Nueva solicitud ${inquiry.reference} · ${inquiry.name}`,
    html: layout(`Nueva solicitud ${inquiry.reference}`, `<h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Nueva solicitud floral</h1><p style="color:#646960;line-height:1.6">Se recibió una nueva solicitud desde el sitio web.</p>${details}<p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#4b5a43;color:#fff;text-decoration:none;font-weight:700">Ver solicitudes</a></p>`),
  })];

  if (inquiry.email) messages.push(resend.emails.send({
    from,
    to: [inquiry.email],
    replyTo: internalRecipient,
    subject: `Recibimos tu solicitud · ${inquiry.reference}`,
    html: layout(`Recibimos tu solicitud ${inquiry.reference}`, `<p style="margin:0 0 8px;color:#747970;font-size:13px;letter-spacing:.08em;text-transform:uppercase">Solicitud ${escapeHtml(inquiry.reference)}</p><h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Gracias, ${escapeHtml(inquiry.name)}.</h1><p style="color:#646960;line-height:1.7">Recibimos los detalles de tu solicitud floral. El equipo de OrosBlooms los revisará y se comunicará contigo para confirmar disponibilidad, entrega y precio final.</p><div style="margin-top:22px;padding:16px;border-radius:14px;background:#f5f2eb"><strong>Guarda esta referencia:</strong><br><span style="font-size:20px">${escapeHtml(inquiry.reference)}</span></div>`),
  }));

  const results = await Promise.all(messages);
  const error = results.find(result => result.error)?.error;
  if (error) throw new Error(`Resend: ${error.message}`);
  return { sent: true as const };
}

type OrderEmail = { reference: string; name: string; email?: string; phone: string; fulfillment: "delivery" | "pickup"; amount: number; sinpeNumber?: string | null };

export async function sendOrderCreatedEmails(order: OrderEmail) {
  if (process.env.EMAIL_TRANSPORT === "mock") return { sent: true as const, mocked: true as const };
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const internalRecipient = process.env.RESEND_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !internalRecipient) return { sent: false as const, reason: "not-configured" as const };
  const resend = new Resend(apiKey);
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/pedidos`;
  const details = `<table style="width:100%;border-collapse:collapse;margin-top:18px">${row("Referencia", order.reference)}${row("Cliente", order.name)}${row("Correo", order.email)}${row("Teléfono", order.phone)}${row("Modalidad", order.fulfillment === "delivery" ? "Entrega" : "Retiro")}${row("Monto SINPE", money(order.amount))}</table>`;
  const messages = [resend.emails.send({ from, to: [internalRecipient], replyTo: order.email || undefined, subject: `Nuevo pedido ${order.reference} · ${order.name}`, html: layout(`Nuevo pedido ${order.reference}`, `<h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Nuevo pedido recibido</h1><p style="color:#646960;line-height:1.6">El cliente creó un pedido y está pendiente de pago por SINPE.</p>${details}<p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#4b5a43;color:#fff;text-decoration:none;font-weight:700">Ver pedidos</a></p>`) })];
  if (order.email) messages.push(resend.emails.send({ from, to: [order.email], replyTo: internalRecipient, subject: `Recibimos tu pedido · ${order.reference}`, html: layout(`Recibimos tu pedido ${order.reference}`, `<h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Gracias, ${escapeHtml(order.name)}.</h1><p style="color:#646960;line-height:1.7">Tu pedido fue creado. Realiza el pago por SINPE Móvil para continuar con su preparación.</p><div style="margin-top:22px;padding:16px;border-radius:14px;background:#f5f2eb"><strong>Referencia:</strong><br><span style="font-size:20px">${escapeHtml(order.reference)}</span><br><strong>Monto a enviar:</strong> ${escapeHtml(money(order.amount))}${order.sinpeNumber ? `<br><strong>Número SINPE:</strong> ${escapeHtml(order.sinpeNumber)}` : ""}</div>`) }));
  const results = await Promise.all(messages); const error = results.find(result => result.error)?.error;
  if (error) throw new Error(`Resend: ${error.message}`);
  return { sent: true as const };
}

export async function sendPaymentProofEmails(proof: { reference: string; name: string; email?: string }) {
  if (process.env.EMAIL_TRANSPORT === "mock") return { sent: true as const, mocked: true as const };
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const internalRecipient = process.env.RESEND_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !internalRecipient) return { sent: false as const, reason: "not-configured" as const };
  const resend = new Resend(apiKey); const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/pedidos`;
  const messages = [resend.emails.send({ from, to: [internalRecipient], replyTo: proof.email || undefined, subject: `Comprobante recibido · ${proof.reference}`, html: layout(`Comprobante recibido ${proof.reference}`, `<h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Comprobante por revisar</h1><p style="color:#646960;line-height:1.7">${escapeHtml(proof.name)} subió el comprobante del pedido <strong>${escapeHtml(proof.reference)}</strong>.</p><p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#4b5a43;color:#fff;text-decoration:none;font-weight:700">Revisar pedido</a></p>`) })];
  if (proof.email) messages.push(resend.emails.send({ from, to: [proof.email], replyTo: internalRecipient, subject: `Comprobante recibido · ${proof.reference}`, html: layout(`Comprobante recibido ${proof.reference}`, `<h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:500">Recibimos tu comprobante.</h1><p style="color:#646960;line-height:1.7">Gracias, ${escapeHtml(proof.name)}. Revisaremos tu pago y te notificaremos cuando quede confirmado.</p><div style="margin-top:22px;padding:16px;border-radius:14px;background:#f5f2eb"><strong>Pedido:</strong><br><span style="font-size:20px">${escapeHtml(proof.reference)}</span></div>`) }));
  const results = await Promise.all(messages); const error = results.find(result => result.error)?.error;
  if (error) throw new Error(`Resend: ${error.message}`);
  return { sent: true as const };
}
