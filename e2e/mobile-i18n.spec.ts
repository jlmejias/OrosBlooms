import { expect, test } from "@playwright/test";

for(const viewport of [{width:375,height:667},{width:390,height:844}])test(`sin overflow principal en ${viewport.width}x${viewport.height}`,async({page})=>{await page.setViewportSize(viewport);for(const route of ["/","/flores","/carrito","/checkout","/solicitar","/acceso-admin"]){await page.goto(route);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,route).toBeLessThanOrEqual(1);}});

test("búsqueda y gracias respetan idioma y referencia",async({page})=>{await page.goto("/buscar");await page.context().addCookies([{name:"oros_locale",value:"en",domain:"127.0.0.1",path:"/"}]);await page.reload();await expect(page.getByRole("heading",{name:"Find your moment."})).toBeVisible();await page.goto("/solicitar/gracias");await expect(page).toHaveURL(/\/solicitar$/);});

test("administración móvil navega mediante el drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/acceso-admin");
  await page.getByLabel("Correo").fill("admin@orosblooms.qa");
  await page.getByLabel("Contraseña").fill("QaAdmin2026!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.getByRole("button", { name: "Abrir menú de administración" }).click();
  await page.getByRole("menuitem", { name: "Categorías" }).click();
  await expect(page).toHaveURL(/\/admin\/categorias$/);
  await expect(page.getByRole("heading", { name: "Categorías", level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
