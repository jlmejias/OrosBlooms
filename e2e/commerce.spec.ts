import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { query } from "./db";

test("producto, carrito, desglose y pedido SINPE funcionan de punta a punta", async ({ page }) => {
  await page.goto("/flores/rosas-de-amor");
  await page.getByRole("button", { name: /Agregar selección|Add selection/ }).click();
  await page.goto("/carrito");
  await expect(page.getByText("Rosas de Amor")).toBeVisible();
  await page.getByRole("link", { name: /Continuar al pago|Continue to checkout/ }).click();
  await page.getByLabel(/Nombre|Name/).fill("Comprador QA");
  await page.getByLabel(/Teléfono|Phone/).fill("+506 7111 2222");
  await page.getByLabel(/Dirección|Delivery address/).fill("Dirección QA, San José");
  await expect(page.getByText(/Adelanto requerido|Required deposit/)).toBeVisible();
  await page.getByRole("button", { name: /Crear pedido SINPE|Create SINPE order/ }).click();
  await expect(page.getByRole("heading", { name: /Pedido creado|Order created/ })).toBeVisible();
  const reference = (await page.getByText(/PED-/).first().textContent())?.match(/PED-[A-Z0-9]+/)?.[0];
  expect(reference).toBeTruthy();
  const rows = await query<{ subtotal: number; deposit: number; balance: number }>("select subtotal, deposit, balance from orders where reference = $1", [reference]);
  expect(rows).toHaveLength(1);
  expect(rows[0].deposit + rows[0].balance).toBe(rows[0].subtotal + 3000);
});

test("checkout acepta combo y una clave idempotente crea un solo pedido", async ({ request }) => {
  const [combo] = await query<{ id: string }>("select id from combos where slug = 'celebracion-luminosa'");
  const key = randomUUID();
  const body = { name: "Combo QA", email: "combo@example.test", phone: "+50672223333", fulfillment: "pickup", paymentMethod: "sinpe", items: [{ kind: "combo", comboId: combo.id, quantity: 1 }] };
  const first = await request.post("/api/checkout", { headers: { "idempotency-key": key }, data: body });
  const second = await request.post("/api/checkout", { headers: { "idempotency-key": key }, data: body });
  expect(first.ok()).toBeTruthy(); expect(second.ok()).toBeTruthy();
  const firstBody = await first.json(); const secondBody = await second.json();
  expect(secondBody.reference).toBe(firstBody.reference);
  const [{ count }] = await query<{ count: number }>("select count(*)::int as count from orders where idempotency_key = $1", [key]);
  expect(count).toBe(1);
});

test("checkout conserva productos repetidos, complementos y consolida inventario", async ({ request }) => {
  const rows = await query<{ id: string; variant_id: string; slug: string }>("select p.id, pv.id as variant_id, p.slug from products p join product_variants pv on pv.product_id=p.id where p.slug=any($1::text[])", [["jardin-rosado", "tarjeta-dedicatoria"]]);
  const products = new Map(rows.map(row => [row.slug, row]));
  const flower = products.get("jardin-rosado")!;
  const complement = products.get("tarjeta-dedicatoria")!;
  const key = randomUUID();
  const response = await request.post("/api/checkout", {
    headers: { "idempotency-key": key },
    data: {
      name: "Carrito repetido QA", email: "repetido@example.test", phone: "+50673334444", fulfillment: "pickup", paymentMethod: "sinpe",
      items: [
        { kind: "product", productId: flower.id, variantId: flower.variant_id, quantity: 2 },
        { kind: "product", productId: flower.id, variantId: flower.variant_id, quantity: 3 },
        { kind: "product", productId: complement.id, variantId: complement.variant_id, quantity: 2 },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
  const { reference } = await response.json();
  const [order] = await query<{ id: string; subtotal: number }>("select id, subtotal from orders where reference=$1", [reference]);
  const items = await query<{ quantity: number }>("select quantity from order_items where order_id=$1", [order.id]);
  const inventory = await query<{ variant_id: string; quantity: number }>("select variant_id, quantity from order_inventory_items where order_id=$1", [order.id]);
  expect(order.subtotal).toBe(165000);
  expect(items.map(item => item.quantity).sort((a, b) => a - b)).toEqual([2, 2, 3]);
  expect(inventory.find(item => item.variant_id === flower.variant_id)?.quantity).toBe(5);
  expect(inventory.find(item => item.variant_id === complement.variant_id)?.quantity).toBe(2);
});

test("confirmaciones concurrentes consumen stock una sola vez", async () => {
  const [variant] = await query<{ id: string; product_id: string }>("select pv.id, pv.product_id from product_variants pv join products p on p.id=pv.product_id where p.slug='rosas-de-amor'");
  await query("update product_variants set stock_on_hand=1 where id=$1", [variant.id]);
  const [customer] = await query<{ id: string }>("select id from customers limit 1");
  const orders = await query<{ id: string }>(`insert into orders(reference,customer_id,fulfillment,subtotal,total,deposit,balance,payment_method,payment_status,tracking_token,status) values
    ($1,$3,'pickup',30000,30000,15000,15000,'sinpe','pending_review',$4,'pending'),
    ($2,$3,'pickup',30000,30000,15000,15000,'sinpe','pending_review',$5,'pending') returning id`, [`PED-${randomUUID().slice(0,12)}`, `PED-${randomUUID().slice(0,12)}`, customer.id, randomUUID().replaceAll("-", ""), randomUUID().replaceAll("-", "")]);
  for (const order of orders) await query("insert into order_inventory_items(order_id,variant_id,quantity) values($1,$2,1)", [order.id, variant.id]);

  const {reviewOrderPaymentById}=await import("../services/order-payment");
  const results=await Promise.allSettled(orders.map(order=>reviewOrderPaymentById(order.id,"paid")));
  expect(results.filter(result=>result.status==="fulfilled")).toHaveLength(1);
  const paidOrderIndex=results.findIndex(result=>result.status==="fulfilled");
  const repeated=await reviewOrderPaymentById(orders[paidOrderIndex].id,"paid");
  expect(repeated.changed).toBe(false);
  const [{ paid }] = await query<{ paid: number }>("select count(*) filter(where payment_status='paid')::int as paid from orders where id=any($1::uuid[])", [orders.map(order => order.id)]);
  const [stock] = await query<{ stock_on_hand: number }>("select stock_on_hand from product_variants where id=$1", [variant.id]);
  expect(paid).toBe(1); expect(stock.stock_on_hand).toBe(0);
  const {pool}=await import("../db/client");
  await pool.end();
});
