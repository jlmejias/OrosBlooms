CREATE TABLE "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "visitor_hash" text NOT NULL,
  "path" text NOT NULL,
  "visited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "page_views_visited_at_idx" ON "page_views" USING btree ("visited_at");
--> statement-breakpoint
CREATE INDEX "page_views_path_visited_at_idx" ON "page_views" USING btree ("path", "visited_at");
--> statement-breakpoint
CREATE INDEX "page_views_visitor_visited_at_idx" ON "page_views" USING btree ("visitor_hash", "visited_at");
