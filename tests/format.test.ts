import assert from "node:assert/strict";
import test from "node:test";
import { formatCRC, stringValue } from "../lib/format.ts";

test("stringValue normaliza parámetros de URL", () => {
  assert.equal(stringValue(undefined), "");
  assert.equal(stringValue(["primero", "segundo"]), "primero");
});

test("formatCRC usa colones sin decimales", () => {
  const result = formatCRC(12500);
  assert.match(result, /12[.\s]500/);
  assert.match(result, /₡|CRC/);
});
