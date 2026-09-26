"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, removeCartItem, toggleFavorite, updateCartQuantity, type StoreItem } from "@/lib/store";

export type { StoreItem } from "@/lib/store";
type StoreContextValue = { favorites: string[]; cart: StoreItem[]; toggleFavorite: (slug: string) => void; addItem: (item: StoreItem) => void; removeItem: (index: number) => void; updateQuantity: (index: number, quantity: number) => void; clearCart: () => void };
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<StoreItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setFavorites(JSON.parse(localStorage.getItem("oros-favorites") ?? "[]"));
        const stored = JSON.parse(localStorage.getItem("oros-cart") ?? "[]") as Array<StoreItem | (Omit<Extract<StoreItem, { kind: "product" }>, "kind">)>;
        setCart(stored.map(item => "kind" in item ? item : { ...item, kind: "product" }));
      } catch { /* datos locales inválidos */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("oros-favorites", JSON.stringify(favorites)); }, [favorites, ready]);
  useEffect(() => { if (ready) localStorage.setItem("oros-cart", JSON.stringify(cart)); }, [cart, ready]);
  const value = useMemo<StoreContextValue>(() => ({ favorites, cart, toggleFavorite: slug => setFavorites(current => toggleFavorite(current, slug)), addItem: item => setCart(current => addCartItem(current, item)), removeItem: index => setCart(current => removeCartItem(current, index)), updateQuantity: (index, quantity) => setCart(current => updateCartQuantity(current, index, quantity)), clearCart: () => setCart([]) }), [favorites, cart]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("StoreProvider requerido"); return value; }
