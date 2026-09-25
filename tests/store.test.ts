import assert from "node:assert/strict";
import test from "node:test";
import { cartTotal, removeCartItem, toggleFavorite, updateCartQuantity, type StoreItem } from "../lib/store.ts";

const cart: StoreItem[] = [
  { kind: "product", productId: "1", slug: "rosas", name: "Rosas", price: 12000, quantity: 2 },
  { kind: "product", productId: "2", slug: "lirios", name: "Lirios", price: 9000, quantity: 1 },
];

test("favoritos se agregan y eliminan sin duplicados", () => {
  assert.deepEqual(toggleFavorite([], "rosas"), ["rosas"]);
  assert.deepEqual(toggleFavorite(["rosas"], "rosas"), []);
});

test("carrito calcula totales y elimina por índice", () => {
  assert.equal(cartTotal(cart), 33000);
  assert.deepEqual(removeCartItem(cart, 0), [cart[1]]);
});

test("cantidad se normaliza a enteros positivos", () => {
  assert.equal(updateCartQuantity(cart, 0, 2.8)[0].quantity, 2);
  assert.equal(updateCartQuantity(cart, 0, 0)[0].quantity, 1);
  assert.equal(updateCartQuantity(cart, 0, Number.NaN)[0].quantity, 1);
});
