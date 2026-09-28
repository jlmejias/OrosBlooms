import { expect, test } from "@playwright/test";

test("admin no filtra payload, permite login y revoca al cerrar sesión",async({page,request})=>{
  const response=await request.get("/admin/solicitudes",{maxRedirects:0});const body=await response.text();
  expect(body).not.toContain("Bandeja de solicitudes");expect(body).not.toContain("Cliente QA Uno");
  await page.goto("/admin");await expect(page).toHaveURL(/acceso-admin/,{timeout:30_000});
  await page.getByLabel("Usuario").fill("OrosBlooms");await page.locator('input[name="password"]').fill("QaAdmin2026!");await page.getByRole("button",{name:"Ingresar"}).click();
  await expect(page).toHaveURL(/\/admin$/,{timeout:30_000});await expect(page.getByRole("heading",{name:"Resumen"})).toBeVisible();
  await page.getByRole("button",{name:"Cerrar sesión"}).click();await expect(page).toHaveURL(/acceso-admin/);await page.goto("/admin");await expect(page).toHaveURL(/acceso-admin/);
});

test("rutas internas y medios privados rechazan una sesión ausente", async ({ page, request }) => {
  for (const route of ["/admin", "/admin/pedidos", "/admin/productos", "/admin/configuracion"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/acceso-admin/);
  }
  const media = await request.get("/api/private-media/00000000-0000-0000-0000-000000000000");
  expect(media.status()).toBe(401);
});

test("login incorrecto no crea sesión", async ({ page }) => {
  await page.goto("/acceso-admin");
  await page.getByLabel("Usuario").fill("OrosBlooms");
  await page.locator('input[name="password"]').fill("incorrecta");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/error=1/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/acceso-admin/);
});

test("cookies manipuladas, expiradas o con firma inválida no autorizan", async ({ page }) => {
  const base = "http://127.0.0.1:3197";
  const valid = (await import("../lib/admin-session")).createAdminSessionToken("OrosBlooms", "qa-only-session-secret-with-at-least-32-characters", Date.now() + 60_000);
  const [payload, signature] = valid.split(".");
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; role: string; exp: number };
  const candidates = [
    `${Buffer.from(JSON.stringify({ ...decoded, email: "otro" })).toString("base64url")}.${signature}`,
    `${Buffer.from(JSON.stringify({ ...decoded, role: "owner" })).toString("base64url")}.${signature}`,
    `${Buffer.from(JSON.stringify({ ...decoded, exp: Date.now() + 120_000 })).toString("base64url")}.${signature}`,
    (await import("../lib/admin-session")).createAdminSessionToken("OrosBlooms", "qa-only-session-secret-with-at-least-32-characters", Date.now() - 1),
    `${payload}.${signature.slice(0, -1)}x`,
  ];
  for (const value of candidates) {
    await page.context().clearCookies();
    await page.context().addCookies([{ name: "oros_admin_session", value, url: base }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/acceso-admin/);
  }
});
