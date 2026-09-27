import assert from "node:assert/strict";
import test from "node:test";
import { formatUSD, stringValue } from "../lib/format.ts";

test("stringValue normaliza parámetros de URL", () => {
  assert.equal(stringValue(undefined), "");
  assert.equal(stringValue(["primero", "segundo"]), "primero");
});

test("formatUSD usa dólares con dos decimales", () => {
  const result = formatUSD(125);
  assert.equal(result, "$125.00");
});
