import { expect, test } from "@playwright/test";

test("admin no filtra payload, permite login y revoca al cerrar sesión",async({page,request})=>{
  const response=await request.get("/admin/solicitudes",{maxRedirects:0});const body=await response.text();
  expect(body).not.toContain("Bandeja de solicitudes");expect(body).not.toContain("Cliente QA Uno");
  await page.goto("/admin");await expect(page).toHaveURL(/acceso-admin/);
  await page.getByLabel("Correo").fill("admin@orosblooms.qa");await page.getByLabel("Contraseña").fill("QaAdmin2026!");await page.getByRole("button",{name:"Ingresar"}).click();
  await expect(page).toHaveURL(/\/admin$/);await expect(page.getByRole("heading",{name:"Resumen"})).toBeVisible();
  await page.getByRole("button",{name:"Cerrar sesión"}).click();await expect(page).toHaveURL(/acceso-admin/);await page.goto("/admin");await expect(page).toHaveURL(/acceso-admin/);
});
