import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderPricing } from "../lib/order-pricing.ts";

test("calcula entrega, adelanto y saldo desde una sola función", () => {
  assert.deepEqual(calculateOrderPricing(20_000, 3_000, 50), { subtotal: 20_000, deliveryFee: 3_000, total: 23_000, depositPercent: 50, deposit: 11_500, balance: 11_500 });
  assert.deepEqual(calculateOrderPricing(10_001, 0, 50).deposit, 5_001);
});

test("limita porcentajes y montos inválidos", () => {
  assert.deepEqual(calculateOrderPricing(-1, -2, 120), { subtotal: 0, deliveryFee: 0, total: 0, depositPercent: 100, deposit: 0, balance: 0 });
});
