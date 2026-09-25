export type OrderPricing = { subtotal: number; deliveryFee: number; total: number; depositPercent: number; deposit: number; balance: number };

export function calculateOrderPricing(subtotal: number, deliveryFee: number, depositPercent: number): OrderPricing {
  const safeSubtotal = Math.max(0, Math.round(subtotal));
  const safeDeliveryFee = Math.max(0, Math.round(deliveryFee));
  const safePercent = Math.min(100, Math.max(0, depositPercent));
  const total = safeSubtotal + safeDeliveryFee;
  const deposit = Math.ceil(total * safePercent / 100);
  return { subtotal: safeSubtotal, deliveryFee: safeDeliveryFee, total, depositPercent: safePercent, deposit, balance: total - deposit };
}
