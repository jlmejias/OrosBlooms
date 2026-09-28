import path from "node:path";
import { expect, test } from "@playwright/test";
import { query } from "./db";

test("administración modifica el contenido y reemplaza la imagen de Bodas",async({page})=>{
  const [before]=await query<{id:string;asset_id:string|null}>("select s.id,s.image_id as asset_id from services s where s.slug='bodas' or s.type='wedding' limit 1");
  const [usage]=before.asset_id?await query<{references:number}>("select ((select count(*) from gallery_images where media_asset_id=$1)+(select count(*) from product_images where media_asset_id=$1)+(select count(*) from inquiry_images where media_asset_id=$1)+(select count(*) from orders where payment_proof_asset_id=$1))::int as references",[before.asset_id]):[{references:0}];
  await page.goto("/acceso-admin");
  await page.getByLabel("Usuario").fill("OrosBlooms");
  await page.locator('input[name="password"]').fill("QaAdmin2026!");
  await page.getByRole("button",{name:"Ingresar"}).click();
  await expect(page).toHaveURL(/\/admin$/,{timeout:30_000});
  await page.goto("/admin/servicios");
  await expect(page.getByRole("heading",{name:"Servicios"})).toBeVisible();
  await expect(page.getByRole("status",{name:"Cargando"})).toBeHidden({timeout:30_000});
  const row=page.locator("tbody tr").filter({hasText:/Bodas|Wedding/i}).first();
  const edit=row.getByRole("button",{name:"Editar"});
  await edit.click();
  const modal=page.getByRole("dialog");
  if(!await modal.isVisible().catch(()=>false)){
    await expect(page.getByRole("status",{name:"Cargando"})).toBeHidden({timeout:30_000});
    await edit.click();
  }
  await expect(modal).toBeVisible();
  await modal.getByLabel("Título secundario en español").fill("Una celebración creada para ustedes.");
  await modal.locator('input[name="imageFile"]').setInputFiles(path.join(process.cwd(),"public","home-wedding.webp"));
  await modal.getByRole("button",{name:"Guardar cambios"}).click();
  await expect(modal).toBeHidden({timeout:30_000});

  await page.goto("/bodas");
  await expect(page.getByRole("heading",{name:"Una celebración creada para ustedes."})).toBeVisible();
  const [after]=await query<{asset_id:string|null;url:string|null}>("select s.image_id as asset_id,m.url from services s left join media_assets m on m.id=s.image_id where s.id=$1",[before.id]);
  expect(after.asset_id).toBeTruthy();
  expect(after.asset_id).not.toBe(before.asset_id);
  expect(after.url).toContain("/api/e2e-media/services/");
  if(before.asset_id)expect(await query("select id from media_assets where id=$1",[before.asset_id])).toHaveLength(usage.references?1:0);
});
