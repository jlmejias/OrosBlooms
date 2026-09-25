import assert from "node:assert/strict";
import test from "node:test";
import { customerIdentityKey, normalizeEmail, normalizePhone } from "../lib/customer-identity.ts";

test("normaliza email y teléfono antes de construir la identidad", () => {
  assert.equal(normalizeEmail(" Jose@Example.COM "), "jose@example.com");
  assert.equal(normalizePhone("+506 8888-7777"), "+50688887777");
  assert.equal(customerIdentityKey(" Jose@Example.COM ", "+506 8888-7777"), "jose@example.com|+50688887777");
});

test("no fusiona personas cuando solo uno de dos contactos coincide", () => {
  assert.notEqual(customerIdentityKey("a@example.com", "+50611111111"), customerIdentityKey("a@example.com", "+50622222222"));
  assert.notEqual(customerIdentityKey("a@example.com", "+50611111111"), customerIdentityKey("b@example.com", "+50611111111"));
});
