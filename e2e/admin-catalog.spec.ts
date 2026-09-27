import { expect,test } from "@playwright/test";
import { query } from "./db";
import { createAdminSessionToken } from "../lib/admin-session";

test("registra visitas públicas anónimas y las muestra en administración",async({page})=>{
  const [{total: before}]=await query<{total:string}>("select count(*)::text as total from page_views");
  const tracked=page.waitForResponse(response=>response.url().endsWith("/api/analytics/pageview"));
  await page.goto("/");
  expect((await tracked).status()).toBe(204);
  await expect.poll(async()=>{const[{total}]=await query<{total:string}>("select count(*)::text as total from page_views");return Number(total);}).toBeGreaterThan(Number(before));
  const [record]=await query<{path:string;visitor_hash:string}>("select path,visitor_hash from page_views order by visited_at desc limit 1");
  expect(record.path).toBe("/");
  expect(record.visitor_hash).toMatch(/^[a-f0-9]{64}$/);
  const token=createAdminSessionToken("OrosBlooms","qa-only-session-secret-with-at-least-32-characters",Date.now()+60_000);
  await page.context().addCookies([{name:"oros_admin_session",value:token,url:"http://127.0.0.1:3197"}]);
  await page.goto("/admin");
  await expect(page.getByText("Visitantes únicos hoy")).toBeVisible();
});

test("admin crea categoría y producto publicable que aparece en catálogo",async({page})=>{
  await page.goto("/acceso-admin");await page.getByLabel("Correo").fill("admin@orosblooms.qa");await page.getByLabel("Contraseña").fill("QaAdmin2026!");await page.getByRole("button",{name:"Ingresar"}).click();await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/productos");await page.getByRole("button",{name:"Nuevo producto"}).click();await page.getByLabel("Nombre").fill("Ramo QA E2E");await expect(page.getByLabel("Identificador URL")).toHaveValue("ramo-qa-e2e");await page.getByLabel("Precio").fill("24500");await page.getByRole("button",{name:"Nueva categoría"}).click();const dialog=page.getByRole("dialog",{name:"Nueva categoría"});await dialog.getByLabel("Nombre de categoría").fill("QA Temporal");await dialog.getByRole("button",{name:"Crear y seleccionar"}).click();await expect(dialog).toBeHidden();await expect(page.getByLabel("Nombre")).toHaveValue("Ramo QA E2E");await expect(page.getByLabel("Precio")).toHaveValue("24500");await expect(page.getByLabel("Categoría")).toHaveValue(/.+/);await page.getByLabel("Tipo").selectOption("floral");await page.getByLabel("Estado").selectOption("active");await page.getByLabel("Descripción").fill("Producto creado por la suite E2E");await page.locator(".product-image-dropzone input[type=file]").setInputFiles("public/home-hero.webp");await page.getByRole("button",{name:"Crear producto"}).click();
  await page.goto("/flores/ramo-qa-e2e");await expect(page.getByRole("heading",{name:"Ramo QA E2E"})).toBeVisible();await expect(page.locator(".detail-price")).toContainText("24");
});

test("admin conserva formato y color en la descripción del producto",async({page})=>{
  const [product]=await query<{id:string}>("select id from products where slug='rosas-de-amor'");
  const token=createAdminSessionToken("OrosBlooms","qa-only-session-secret-with-at-least-32-characters",Date.now()+60_000);
  await page.context().addCookies([{name:"oros_admin_session",value:token,url:"http://127.0.0.1:3197"}]);
  await page.goto(`/admin/productos?edit=${product.id}`);
  const editor=page.getByLabel("Descripción del producto");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("Descripción con color");
  await page.keyboard.press("ControlOrMeta+A");
  await page.getByLabel("Color del texto").fill("#d414a6");
  await page.getByRole("button",{name:"Negrita"}).click();
  await page.getByRole("button",{name:"Guardar cambios"}).click();
  await expect(page.getByText("Guardado correctamente.")).toBeVisible();
  const [stored]=await query<{description:string}>("select description from products where id=$1",[product.id]);
  expect(stored.description).toMatch(/color:(?:#d414a6|rgb\(212, 20, 166\))/);
  expect(stored.description).toContain("<strong>");
  await page.goto(`/admin/productos?edit=${product.id}`);
  await expect(page.getByLabel("Descripción del producto").locator("span")).toHaveCSS("color","rgb(212, 20, 166)");
});
