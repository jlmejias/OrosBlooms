ALTER TABLE "orders" ADD COLUMN "idempotency_key" text;
CREATE UNIQUE INDEX "orders_idempotency_unique" ON "orders" ("idempotency_key");

ALTER TABLE "order_items" ADD COLUMN "combo_id" uuid REFERENCES "combos"("id") ON DELETE set null;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_source_check" CHECK (num_nonnulls("product_id", "combo_id") = 1) NOT VALID;

CREATE TABLE "order_inventory_items" (
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE restrict,
  "quantity" integer NOT NULL,
  CONSTRAINT "order_inventory_items_order_id_variant_id_pk" PRIMARY KEY("order_id", "variant_id"),
  CONSTRAINT "order_inventory_quantity_check" CHECK ("quantity" > 0)
);
CREATE INDEX "order_inventory_variant_idx" ON "order_inventory_items" ("variant_id");

INSERT INTO "order_inventory_items" ("order_id", "variant_id", "quantity")
SELECT "order_id", "variant_id", SUM("quantity")::integer
FROM "order_items"
WHERE "variant_id" IS NOT NULL
GROUP BY "order_id", "variant_id"
ON CONFLICT ("order_id", "variant_id") DO NOTHING;
