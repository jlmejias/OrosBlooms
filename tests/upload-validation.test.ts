import assert from "node:assert/strict";
import test from "node:test";
import { hasValidImageSignature } from "../lib/upload-validation.ts";

test("valida la firma real y no confía solamente en el MIME", () => {
  assert.equal(hasValidImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0x00]), "image/jpeg"), true);
  assert.equal(hasValidImageSignature(new TextEncoder().encode("contenido falso"), "image/jpeg"), false);
  assert.equal(hasValidImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"), true);
  assert.equal(hasValidImageSignature(new TextEncoder().encode("RIFF1234WEBP"), "image/webp"), true);
});
