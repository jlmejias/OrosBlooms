import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hashPassword, verifyPassword } from "../lib/password.ts";
import { createAdminSessionToken, verifyAdminSessionToken } from "../lib/admin-session.ts";

test("scrypt valida la contraseña y rechaza valores incorrectos", async () => {
  const hash = await hashPassword("Una-clave-segura-2026", "salt-de-prueba-seguro");
  assert.equal(await verifyPassword("Una-clave-segura-2026", hash), true);
  assert.equal(await verifyPassword("incorrecta", hash), false);
  assert.equal(await verifyPassword("Una-clave-segura-2026", "malformado"), false);
});

test("cada página administrativa autoriza antes de consultar datos", async () => {
  const dashboard = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
  const section = await readFile(new URL("../app/admin/[section]/page.tsx", import.meta.url), "utf8");
  assert.ok(dashboard.indexOf("await requireAdmin()") < dashboard.indexOf("db.select"));
  assert.ok(section.indexOf("await requireAdmin()") < section.indexOf("await params"));
  assert.ok(section.indexOf("await requireAdmin()") < section.indexOf("db.select"));
});

test("la sesión rechaza alteraciones, expiración y rotación de secreto", () => {
  const now=1_800_000_000_000;const token=createAdminSessionToken("admin@example.test","a".repeat(32),now+60_000);
  assert.equal(verifyAdminSessionToken(token,"a".repeat(32),now)?.email,"admin@example.test");
  assert.equal(verifyAdminSessionToken(`${token}x`,"a".repeat(32),now),null);
  assert.equal(verifyAdminSessionToken(token,"b".repeat(32),now),null);
  assert.equal(verifyAdminSessionToken(token,"a".repeat(32),now+60_001),null);
});
