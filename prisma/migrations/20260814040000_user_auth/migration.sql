-- Add auth fields with temporary backfill for existing rows, then enforce NOT NULL + unique
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "password" TEXT;

UPDATE "users" SET "username" = 'user' || "id"::text, "password" = '' WHERE "username" IS NULL;

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
