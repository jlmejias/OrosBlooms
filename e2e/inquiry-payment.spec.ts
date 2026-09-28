import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { query } from "./db";

async function createProofOrder(request: APIRequestContext, email: string) {
  const [product]=await query<{id:string;variant_id:string}>("select p.id,pv.id as variant_id from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado'");
  const checkout=await request.post("/api/checkout",{headers:{"idempotency-key":randomUUID()},data:{name:"Pago QA",email,phone:"+50674445555",fulfillment:"pickup",paymentMethod:"zelle",items:[{kind:"product",productId:product.id,variantId:product.variant_id,quantity:1}]}});
  expect(checkout.ok()).toBeTruthy();
  return checkout.json();
}

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

test("comprobante Zelle se almacena de forma privada y pasa a revisión",async({request})=>{
  const [product]=await query<{id:string;variant_id:string;stock_on_hand:number}>("select p.id,pv.id as variant_id,pv.stock_on_hand from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado'");
  const checkout=await request.post("/api/checkout",{headers:{"idempotency-key":randomUUID()},data:{name:"Pago QA",email:"pago@example.test",phone:"+50674445555",fulfillment:"pickup",paymentMethod:"zelle",items:[{kind:"product",productId:product.id,variantId:product.variant_id,quantity:1}]}});
  expect(checkout.ok()).toBeTruthy();const order=await checkout.json();
  const proof=await request.post("/api/payment-proof",{multipart:{reference:order.reference,token:order.trackingToken,proof:{name:"proof.png",mimeType:"image/png",buffer:Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])}}});
  expect(proof.ok()).toBeTruthy();
  const [stored]=await query<{payment_status:string;payment_proof_asset_id:string|null}>("select payment_status,payment_proof_asset_id from orders where reference=$1",[order.reference]);
  expect(stored.payment_status).toBe("pending_review");
  expect(stored.payment_proof_asset_id).toBeTruthy();
});

test("comprobantes JPG y WebP reales son aceptados",async({request})=>{
  const cases=[
    {name:"proof.jpg",mimeType:"image/jpeg",buffer:Buffer.from([0xff,0xd8,0xff,0xe0])},
    {name:"proof.webp",mimeType:"image/webp",buffer:Buffer.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50])},
  ];
  for(const [index,file] of cases.entries()){
    const order=await createProofOrder(request,`format-${index}@example.test`);
    const response=await request.post("/api/payment-proof",{multipart:{reference:order.reference,token:order.trackingToken,proof:file}});
    expect(response.ok(),file.name).toBeTruthy();
  }
});

test("comprobantes falsos, MIME inconsistente y tamaño excesivo son rechazados",async({request})=>{
  const order=await createProofOrder(request,"invalid-proof@example.test");
  const cases=[
    {name:"renamed.png",mimeType:"image/png",buffer:Buffer.from("plain text")},
    {name:"renamed.jpg",mimeType:"image/jpeg",buffer:Buffer.from("<html><script>alert(1)</script></html>")},
    {name:"wrong.jpg",mimeType:"image/jpeg",buffer:Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])},
    {name:"large.png",mimeType:"image/png",buffer:Buffer.alloc(5_000_001,0)},
  ];
  for(const file of cases){
    const response=await request.post("/api/payment-proof",{multipart:{reference:order.reference,token:order.trackingToken,proof:file}});
    expect(response.status(),file.name).toBe(400);
  }
  const [stored]=await query<{payment_status:string;payment_proof_asset_id:string|null}>("select payment_status,payment_proof_asset_id from orders where reference=$1",[order.reference]);
  expect(stored).toEqual({payment_status:"unpaid",payment_proof_asset_id:null});
});
