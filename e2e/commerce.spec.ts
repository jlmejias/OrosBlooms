import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { query } from "./db";

test("producto, carrito, desglose y pedido Zelle funcionan de punta a punta", async ({ page }) => {
  await page.goto("/flores/rosas-de-amor");
  await page.getByRole("button", { name: /Agregar selección|Add selection/ }).click();
  await page.getByRole("dialog", { name: /Agregado al carrito|Added to cart/ }).getByRole("button", { name: /Ir al carrito|Go to cart/ }).click();
  await expect(page.getByRole("heading", { name: "Rosas de Amor" })).toBeVisible();
  await page.getByRole("link", { name: /Continuar al pago|Continue to checkout/ }).click();
  await page.getByRole("textbox", { name: /Nombre completo|Full name/i }).fill("Comprador QA");
  await page.getByRole("textbox", { name: /Teléfono|Phone/i }).fill("+506 7111 2222");
  await page.getByRole("textbox", { name: /Correo electrónico|Email address/i }).fill("comprador@example.test");
  await page.getByRole("textbox", { name: /Dirección de entrega|Delivery address/i }).fill("Dirección QA, San José");
  await expect(page.getByText(/Adelanto a pagar hoy|Deposit due today/)).toBeVisible();
  await page.getByRole("button", { name: /Crear pedido Zelle|Create Zelle order/ }).click();
  const dialog = page.getByRole("dialog", { name: /Confirma tu pago con Zelle|Confirm your Zelle payment/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Pago requerido hoy|Payment due today/)).toBeVisible();
  await dialog.getByRole("button", { name: /Crear pedido|Create order/ }).dblclick();
  await expect(page.getByRole("heading", { name: /Tu pedido fue creado|Your order was created/ })).toBeVisible();
  const reference = (await page.getByText(/PED-/).first().textContent())?.match(/PED-[A-Z0-9]+/)?.[0];
  expect(reference).toBeTruthy();
  const rows = await query<{ subtotal: number; deposit: number; balance: number }>("select subtotal, deposit, balance from orders where reference = $1", [reference]);
  expect(rows).toHaveLength(1);
  expect(rows[0].deposit + rows[0].balance).toBe(rows[0].subtotal + 3000);
  const [{ count }] = await query<{ count: number }>("select count(*)::int as count from orders where reference = $1", [reference]);
  expect(count).toBe(1);
});

test("checkout ignora precios, entrega, adelanto y total manipulados por el cliente", async ({ request }) => {
  const [flower] = await query<{ id: string; variant_id: string; price: number }>("select p.id,pv.id as variant_id,pv.price from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado' order by pv.sort_order limit 1");
  const [addon] = await query<{ id: string; variant_id: string; price: number }>("select p.id,pv.id as variant_id,pv.price from products p join product_variants pv on pv.product_id=p.id where p.slug='chocolates-artesanales' order by pv.sort_order limit 1");
  const [settings] = await query<{ delivery_fee: number; deposit_percent: number }>("select (value->>'deliveryFee')::int as delivery_fee,(value->>'depositPercent')::int as deposit_percent from site_settings where key='business'");
  const response = await request.post("/api/checkout", {
    headers: { "idempotency-key": randomUUID() },
    data: {
      name: "Manipulación QA", email: "tamper@example.test", phone: "+50675556666", fulfillment: "delivery", deliveryAddress: "Dirección QA", paymentMethod: "zelle", paymentOption: "deposit",
      price: 1, subtotal: 1, total: 1, deliveryPrice: 0, addonPrice: 0, depositAmount: 999999999,
      items: [
        { kind: "product", productId: flower.id, variantId: flower.variant_id, quantity: 1, price: 1 },
        { kind: "product", productId: addon.id, variantId: addon.variant_id, quantity: 2, addonPrice: 0 },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  const [order] = await query<{ subtotal: number; delivery_fee: number; total: number; deposit: number; balance: number }>("select subtotal,delivery_fee,total,deposit,balance from orders where reference=$1", [result.reference]);
  const expectedSubtotal = flower.price + addon.price * 2;
  const expectedTotal = expectedSubtotal + settings.delivery_fee;
  const expectedDeposit = Math.ceil(expectedTotal * settings.deposit_percent / 100);
  expect(order).toEqual({ subtotal: expectedSubtotal, delivery_fee: settings.delivery_fee, total: expectedTotal, deposit: expectedDeposit, balance: expectedTotal - expectedDeposit });
});

test("adelanto y pago total mantienen saldos válidos", async ({ request }) => {
  const [product] = await query<{ id: string; variant_id: string; price: number }>("select p.id,pv.id as variant_id,pv.price from products p join product_variants pv on pv.product_id=p.id where p.slug='rosas-de-amor' order by pv.sort_order limit 1");
  const create = async (paymentOption: "deposit" | "full", email: string) => {
    const response = await request.post("/api/checkout", { headers: { "idempotency-key": randomUUID() }, data: { name: "Pago QA", email, phone: "+50676667777", fulfillment: "pickup", paymentMethod: "zelle", paymentOption, items: [{ kind: "product", productId: product.id, variantId: product.variant_id, quantity: 1 }] } });
    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    return (await query<{ total: number; deposit: number; balance: number }>("select total,deposit,balance from orders where reference=$1", [result.reference]))[0];
  };
  const deposit = await create("deposit", "deposit@example.test");
  expect(deposit.deposit).toBe(Math.ceil(deposit.total * 0.5));
  expect(deposit.balance).toBe(deposit.total - deposit.deposit);
  const full = await create("full", "full@example.test");
  expect(full).toEqual({ total: product.price, deposit: product.price, balance: 0 });
  expect(deposit.balance).toBeGreaterThanOrEqual(0);
  expect(full.deposit).toBeLessThanOrEqual(full.total);
});

test("requests concurrentes con la misma idempotency key crean un solo pedido", async ({ request }) => {
  const [product] = await query<{ id: string; variant_id: string }>("select p.id,pv.id as variant_id from products p join product_variants pv on pv.product_id=p.id where p.slug='jardin-rosado' order by pv.sort_order limit 1");
  const key = randomUUID();
  const data = { name: "Doble submit QA", email: "double@example.test", phone: "+50677778888", fulfillment: "pickup", paymentMethod: "zelle", items: [{ kind: "product", productId: product.id, variantId: product.variant_id, quantity: 1 }] };
  const responses = await Promise.all([request.post("/api/checkout", { headers: { "idempotency-key": key }, data }), request.post("/api/checkout", { headers: { "idempotency-key": key }, data })]);
  const summaries = await Promise.all(responses.map(async response => ({ status: response.status(), body: await response.text() })));
  expect(responses.some(response => response.ok()), JSON.stringify(summaries)).toBeTruthy();
  expect(responses.every(response => response.ok() || response.status() === 409), JSON.stringify(summaries)).toBeTruthy();
  const [{ count }] = await query<{ count: number }>("select count(*)::int as count from orders where idempotency_key=$1", [key]);
  expect(count).toBe(1);
});

test("checkout acepta combo y una clave idempotente crea un solo pedido", async ({ request }) => {
  const [combo] = await query<{ id: string }>("select id from combos where slug = 'celebracion-luminosa'");
  const key = randomUUID();
  const body = { name: "Combo QA", email: "combo@example.test", phone: "+50672223333", fulfillment: "pickup", paymentMethod: "zelle", items: [{ kind: "combo", comboId: combo.id, quantity: 1 }] };
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
      name: "Carrito repetido QA", email: "repetido@example.test", phone: "+50673334444", fulfillment: "pickup", paymentMethod: "zelle",
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
    ($1,$3,'pickup',30000,30000,15000,15000,'zelle','pending_review',$4,'pending'),
    ($2,$3,'pickup',30000,30000,15000,15000,'zelle','pending_review',$5,'pending') returning id`, [`PED-${randomUUID().slice(0,12)}`, `PED-${randomUUID().slice(0,12)}`, customer.id, randomUUID().replaceAll("-", ""), randomUUID().replaceAll("-", "")]);
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
