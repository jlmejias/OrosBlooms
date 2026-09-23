CREATE TABLE "product_complement_recommendations" (
	"floral_product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
	"complement_product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_complement_recommendations_floral_product_id_complement_product_id_pk" PRIMARY KEY("floral_product_id","complement_product_id"),
	CONSTRAINT "product_complements_distinct" CHECK ("floral_product_id" <> "complement_product_id")
);
--> statement-breakpoint
CREATE INDEX "product_complements_order_idx" ON "product_complement_recommendations" ("floral_product_id","active","sort_order");
--> statement-breakpoint
CREATE TABLE "combos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"image_url" text,
	"price" integer NOT NULL,
	"promotional_price" integer,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combos_prices_check" CHECK ("price" >= 0 AND ("promotional_price" IS NULL OR ("promotional_price" >= 0 AND "promotional_price" <= "price"))),
	CONSTRAINT "combos_dates_check" CHECK ("starts_at" IS NULL OR "ends_at" IS NULL OR "starts_at" < "ends_at")
);
--> statement-breakpoint
CREATE INDEX "combos_public_idx" ON "combos" ("active","featured","starts_at","ends_at");
--> statement-breakpoint
CREATE TABLE "combo_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL REFERENCES "combos"("id") ON DELETE cascade,
	"product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE restrict,
	"variant_id" uuid REFERENCES "product_variants"("id") ON DELETE set null,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "combo_items_quantity_check" CHECK ("quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX "combo_items_combo_idx" ON "combo_items" ("combo_id");
