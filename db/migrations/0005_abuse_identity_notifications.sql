ALTER TABLE "customers" ADD COLUMN "identity_key" text;
WITH identities AS (
  SELECT lower(coalesce(email, '')) || '|' || regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g') AS identity_key,
         count(*) AS occurrences
  FROM "customers"
  GROUP BY 1
)
UPDATE "customers" AS customer
SET "identity_key" = lower(coalesce(customer.email, '')) || '|' || regexp_replace(coalesce(customer.phone, ''), '[^0-9+]', '', 'g')
FROM identities
WHERE identities.identity_key = lower(coalesce(customer.email, '')) || '|' || regexp_replace(coalesce(customer.phone, ''), '[^0-9+]', '', 'g')
  AND identities.occurrences = 1;
CREATE UNIQUE INDEX "customers_identity_unique" ON "customers" ("identity_key");

ALTER TABLE "inquiries" ADD COLUMN "idempotency_key" text;
ALTER TABLE "inquiries" ADD COLUMN "notification_status" text DEFAULT 'pending' NOT NULL;
ALTER TABLE "inquiries" ADD COLUMN "notification_error" text;
ALTER TABLE "inquiries" ADD COLUMN "notification_attempts" integer DEFAULT 0 NOT NULL;
CREATE UNIQUE INDEX "inquiries_idempotency_unique" ON "inquiries" ("idempotency_key");
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_notification_status_check" CHECK ("notification_status" IN ('pending', 'sent', 'failed'));

CREATE TABLE "rate_limits" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "reset_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "rate_limits_reset_idx" ON "rate_limits" ("reset_at");
