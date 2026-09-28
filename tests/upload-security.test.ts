import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { uploadPublicBlob } from "../lib/blob.ts";
import { hasValidImageSignature, hasValidUploadSignature, isValidUploadedFile } from "../lib/upload-validation.ts";

const png = Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
const jpg = Uint8Array.from([0xff,0xd8,0xff,0xe0]);
const webp = Uint8Array.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50]);

test("acepta firmas reales PNG, JPG y WebP", () => {
  assert.equal(hasValidImageSignature(png, "image/png"), true);
  assert.equal(hasValidImageSignature(jpg, "image/jpeg"), true);
  assert.equal(hasValidImageSignature(webp, "image/webp"), true);
});

test("rechaza contenido renombrado y MIME falso", () => {
  const text = new TextEncoder().encode("not an image");
  const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
  assert.equal(hasValidImageSignature(text, "image/png"), false);
  assert.equal(hasValidImageSignature(html, "image/jpeg"), false);
  assert.equal(hasValidImageSignature(png, "image/jpeg"), false);
});

test("aplica lista permitida, archivo no vacío y límite de tamaño", () => {
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  assert.equal(isValidUploadedFile(png, "image/png", png.length, allowed, 5_000_000), true);
  assert.equal(isValidUploadedFile(png, "image/png", 5_000_001, allowed, 5_000_000), false);
  assert.equal(isValidUploadedFile(png, "image/png", 0, allowed, 5_000_000), false);
  assert.equal(isValidUploadedFile(png, "text/plain", png.length, allowed, 5_000_000), false);
});

test("valida también ICO, MP4 y WebM usados por identidad", () => {
  assert.equal(hasValidUploadSignature(Uint8Array.from([0,0,1,0]), "image/x-icon"), true);
  assert.equal(hasValidUploadSignature(new TextEncoder().encode("0000ftyp0000"), "video/mp4"), true);
  assert.equal(hasValidUploadSignature(Uint8Array.from([0x1a,0x45,0xdf,0xa3]), "video/webm"), true);
  assert.equal(hasValidUploadSignature(new TextEncoder().encode("fake"), "video/mp4"), false);
});

test("storage público bloquea contenido falso y path traversal antes de escribir", async () => {
  const previous = process.env.LOCAL_STORAGE_FOR_QA;
  process.env.LOCAL_STORAGE_FOR_QA = "true";
  try {
    const fake = new File(["plain text"], "renamed.png", { type: "image/png" });
    await assert.rejects(() => uploadPublicBlob("products/fake.png", fake), /contenido del archivo/i);
    const valid = new File([png], "valid.png", { type: "image/png" });
    await assert.rejects(() => uploadPublicBlob("../escape.png", valid), /Ruta de archivo inválida/);
  } finally {
    if (previous === undefined) delete process.env.LOCAL_STORAGE_FOR_QA;
    else process.env.LOCAL_STORAGE_FOR_QA = previous;
  }
});

test("todos los flujos raster administrativos pasan por storage validado", async () => {
  const source = await readFile(new URL("../app/admin/actions.ts", import.meta.url), "utf8");
  for (const action of ["saveProduct", "saveGalleryItem", "uploadHomepageSectionImage", "uploadMedia", "saveProductImage", "persistBrandFile"]) {
    assert.match(source, new RegExp(`(?:function|const)\\s+${action}|function ${action}`));
  }
  assert.match(source, /uploadPublicBlob\(/);
  assert.match(await readFile(new URL("../app/api/payment-proof/route.ts", import.meta.url), "utf8"), /hasValidImageSignature/);
  assert.match(await readFile(new URL("../app/(public)/actions.ts", import.meta.url), "utf8"), /hasValidImageSignature/);
});
