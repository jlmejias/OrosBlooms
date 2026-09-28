ALTER TABLE "gallery_items" ADD COLUMN "gallery_category" text DEFAULT 'flores' NOT NULL;
--> statement-breakpoint
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_category_check" CHECK ("gallery_category" IN ('flores', 'bodas', 'eventos', 'personalizados'));
--> statement-breakpoint
CREATE INDEX "gallery_items_public_category_idx" ON "gallery_items" USING btree ("visible", "gallery_category", "sort_order");
