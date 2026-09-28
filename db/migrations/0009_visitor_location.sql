ALTER TABLE "page_views" ADD COLUMN "city" text;
--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "region" text;
--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "country" text;
--> statement-breakpoint
CREATE INDEX "page_views_city_visited_at_idx" ON "page_views" USING btree ("city", "visited_at");
