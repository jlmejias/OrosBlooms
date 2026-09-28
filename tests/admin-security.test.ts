import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { acceptsDevelopmentAdminCredentials, adminSessionSecret } from "../lib/admin-auth-policy.ts";
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
  const [encoded, signature] = token.split(".");
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as { email: string; role: string; exp: number };
  for (const changed of [{ ...payload, email: "attacker@example.test" }, { ...payload, role: "owner" }, { ...payload, exp: now + 120_000 }]) {
    const altered = `${Buffer.from(JSON.stringify(changed)).toString("base64url")}.${signature}`;
    assert.equal(verifyAdminSessionToken(altered,"a".repeat(32),now),null);
  }
  assert.equal(verifyAdminSessionToken(`${token}x`,"a".repeat(32),now),null);
  assert.equal(verifyAdminSessionToken(token,"b".repeat(32),now),null);
  assert.equal(verifyAdminSessionToken(token,"a".repeat(32),now+60_001),null);
});

test("producción rechaza fallback de desarrollo y secretos ausentes o cortos", () => {
  assert.equal(acceptsDevelopmentAdminCredentials({ NODE_ENV: "production" }), false);
  assert.equal(acceptsDevelopmentAdminCredentials({ NODE_ENV: "development" }), true);
  assert.throws(() => adminSessionSecret({ NODE_ENV: "production" }), /32 caracteres/);
  assert.throws(() => adminSessionSecret({ NODE_ENV: "production", ADMIN_SESSION_SECRET: "corto" }), /32 caracteres/);
  assert.equal(adminSessionSecret({ NODE_ENV: "production", ADMIN_SESSION_SECRET: "x".repeat(32) }), "x".repeat(32));
});

test("todas las Server Actions administrativas autorizan dentro de la acción", async () => {
  const sourceText = await readFile(new URL("../app/admin/actions.ts", import.meta.url), "utf8");
  const source = ts.createSourceFile("actions.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exported = source.statements.filter((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && Boolean(node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)));
  assert.ok(exported.length > 20);
  for (const action of exported) assert.match(action.body?.getText(source) ?? "", /await requireAdmin\(\)/, `${action.name?.text} no autoriza en servidor`);
});

test("el Route Handler de medios privados autoriza antes de consultar", async () => {
  const source = await readFile(new URL("../app/api/private-media/[id]/route.ts", import.meta.url), "utf8");
  assert.ok(source.indexOf("getAdminSession") < source.indexOf("db.select"));
});
