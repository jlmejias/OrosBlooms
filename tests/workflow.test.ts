import assert from "node:assert/strict";
import test from "node:test";
import { canTransition, inquiryTransitions, orderTransitions } from "../lib/workflow.ts";

test("impide reabrir solicitudes completadas implícitamente", () => {
  assert.equal(canTransition(inquiryTransitions, "new", "reviewing"), true);
  assert.equal(canTransition(inquiryTransitions, "completed", "new"), false);
});

test("impide devolver pedidos entregados a borrador", () => {
  assert.equal(canTransition(orderTransitions, "pending", "confirmed"), true);
  assert.equal(canTransition(orderTransitions, "delivered", "draft"), false);
});
