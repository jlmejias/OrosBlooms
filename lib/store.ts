export type StoreItem = { productId: string; variantId?: string; slug: string; name: string; price: number; image?: string | null; quantity: number; personalization?: string };

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
