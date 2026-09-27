ALTER TABLE "users" ADD COLUMN "username" text;
UPDATE "users" SET "username" = split_part("email", '@', 1) WHERE "username" IS NULL;
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_lower_unique" ON "users" USING btree (lower("username"));

CREATE TABLE "admin_password_reset_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "admin_password_reset_tokens_user_idx" ON "admin_password_reset_tokens" USING btree ("user_id");
CREATE INDEX "admin_password_reset_tokens_expiry_idx" ON "admin_password_reset_tokens" USING btree ("expires_at");
