import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { query } from "./db";

test("solicitud se guarda aunque el correo sea mock y queda operativamente visible",async({page})=>{
  await page.goto("/solicitar");
  await page.getByLabel(/Nombre|Name/).fill("Solicitud QA");
  await page.getByLabel(/Teléfono|Phone/).fill("+506 7333 4444");
  await page.getByLabel(/Correo|Email/).fill("request@example.test");
  await page.getByRole("button",{name:/Enviar solicitud|Send request/}).click();
  await expect(page).toHaveURL(/solicitar\/gracias\?ref=OB-/);
  const reference=new URL(page.url()).searchParams.get("ref");
  const rows=await query<{notification_status:string}>("select notification_status from inquiries where reference=$1",[reference]);
  expect(rows).toEqual([{notification_status:"sent"}]);
});

test("comprobante SINPE se almacena de forma privada y pasa a revisión",async({request})=>{
  const [product]=await query<{id:string;variant_id:string;stock_on_hand:number}>("select p.id,pv.id as variant_id,pv.stock_on_hand from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado'");
  const checkout=await request.post("/api/checkout",{headers:{"idempotency-key":randomUUID()},data:{name:"Pago QA",email:"pago@example.test",phone:"+50674445555",fulfillment:"pickup",paymentMethod:"sinpe",items:[{kind:"product",productId:product.id,variantId:product.variant_id,quantity:1}]}});
  expect(checkout.ok()).toBeTruthy();const order=await checkout.json();
  const proof=await request.post("/api/payment-proof",{multipart:{reference:order.reference,token:order.trackingToken,proof:{name:"proof.png",mimeType:"image/png",buffer:Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])}}});
  expect(proof.ok()).toBeTruthy();
  const [stored]=await query<{payment_status:string;payment_proof_asset_id:string|null}>("select payment_status,payment_proof_asset_id from orders where reference=$1",[order.reference]);
  expect(stored.payment_status).toBe("pending_review");
  expect(stored.payment_proof_asset_id).toBeTruthy();
});
