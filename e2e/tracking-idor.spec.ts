import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { query } from "./db";

async function createOrder(request: APIRequestContext, email: string) {
  const [product] = await query<{ id: string; variant_id: string }>("select p.id,pv.id as variant_id from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado' order by pv.sort_order limit 1");
  const response = await request.post("/api/checkout", { headers: { "idempotency-key": randomUUID() }, data: { name: `Cliente ${email}`, email, phone: "+50678889999", fulfillment: "pickup", paymentMethod: "zelle", items: [{ kind: "product", productId: product.id, variantId: product.variant_id, quantity: 1 }] } });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{ reference: string; trackingToken: string; trackingUrl: string }>;
}

test("tracking exige la combinación exacta de referencia y token", async ({ page, request }) => {
  const first = await createOrder(request, "first@example.test");
  const second = await createOrder(request, "second@example.test");
  const valid = await request.get(first.trackingUrl);
  expect(valid.status()).toBe(200);
  const validBody = await valid.text();
  expect(validBody).toContain(first.reference);
  expect(validBody).not.toContain(second.reference);

  for (const url of [
    `/pedido/PED-INEXISTENTE?token=${first.trackingToken}`,
    `/pedido/${first.reference}?token=token-incorrecto`,
    `/pedido/${first.reference}?token=${second.trackingToken}`,
    `/pedido/${second.reference}?token=${first.trackingToken}`,
  ]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "Página no encontrada." })).toBeVisible();
    await expect(page.getByText("first@example.test", { exact: true })).toHaveCount(0);
    await expect(page.getByText("second@example.test", { exact: true })).toHaveCount(0);
  }
});

test("ids internos de pedido y cliente no exponen registros públicos", async ({ page, request }) => {
  const first = await createOrder(request, "idor-order@example.test");
  const [stored] = await query<{ id: string; customer_id: string }>("select id,customer_id from orders where reference=$1", [first.reference]);
  await page.goto(`/pedido/${stored.id}?token=${first.trackingToken}`);
  await expect(page.getByRole("heading", { name: "Página no encontrada." })).toBeVisible();
  await expect(page.getByText("idor-order@example.test", { exact: true })).toHaveCount(0);
  await page.goto(`/admin/clientes?edit=${stored.customer_id}`);
  await expect(page).toHaveURL(/\/acceso-admin/);
  await expect(page.getByText("idor-order@example.test", { exact: true })).toHaveCount(0);
});

test("un token de tracking no concede acceso a comprobantes privados", async ({ request }) => {
  const first = await createOrder(request, "proof-one@example.test");
  const second = await createOrder(request, "proof-two@example.test");
  const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  for (const order of [first, second]) {
    const upload = await request.post("/api/payment-proof", { multipart: { reference: order.reference, token: order.trackingToken, proof: { name: "proof.png", mimeType: "image/png", buffer: png } } });
    expect(upload.ok()).toBeTruthy();
  }
  const assets = await query<{ reference: string; asset_id: string }>("select reference,payment_proof_asset_id as asset_id from orders where reference=any($1::text[])", [[first.reference, second.reference]]);
  expect(assets).toHaveLength(2);
  for (const asset of assets) {
    const response = await request.get(`/api/private-media/${asset.asset_id}?token=${first.trackingToken}`);
    expect(response.status()).toBe(401);
    expect(await response.text()).not.toContain("PNG");
  }
});
