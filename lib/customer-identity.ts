export function normalizeEmail(email?: string | null) {
  const value = email?.trim().toLowerCase();
  return value || null;
}

export function normalizePhone(phone?: string | null) {
  const value = phone?.trim().replace(/(?!^)\D/g, "");
  return value || null;
}

export function customerIdentityKey(email?: string | null, phone?: string | null) {
  const normalizedEmail = normalizeEmail(email) ?? "";
  const normalizedPhone = normalizePhone(phone) ?? "";
  if (!normalizedEmail && !normalizedPhone) throw new Error("Se requiere al menos un dato de contacto.");
  return `${normalizedEmail}|${normalizedPhone}`;
}
