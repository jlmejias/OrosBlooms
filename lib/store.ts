type StoreItemBase = { slug: string; name: string; price: number; image?: string | null; quantity: number; personalization?: string };
export type StoreItem = StoreItemBase & (
  | { kind: "product"; productId: string; variantId?: string }
  | { kind: "combo"; comboId: string }
);

export function toggleFavorite(items: string[], slug: string) {
  return items.includes(slug) ? items.filter(item => item !== slug) : [...items, slug];
}

export function removeCartItem(items: StoreItem[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function updateCartQuantity(items: StoreItem[], index: number, quantity: number) {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: safeQuantity } : item);
}

export function cartTotal(items: StoreItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function checkoutLines(items: StoreItem[]) {
  return items.map(item => item.kind === "combo"
    ? { kind: item.kind, comboId: item.comboId, quantity: item.quantity, personalization: item.personalization }
    : { kind: item.kind, productId: item.productId, variantId: item.variantId, quantity: item.quantity, personalization: item.personalization });
}
