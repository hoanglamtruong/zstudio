-- Add ownership tracking (created_by_id/name) + soft-hide (active) to all
-- production entities. Existing rows are backfilled to the leader user (id 1).

ALTER TABLE "characters" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "characters" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "characters" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "taps" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "taps" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "taps" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "scenes" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "scenes" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "scenes" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "shots" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "shots" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "shots" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "shot_contents" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "shot_contents" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "shot_contents" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "frames" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "frames" ADD COLUMN "created_by_name" TEXT;
ALTER TABLE "frames" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

UPDATE "characters" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;
UPDATE "taps" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;
UPDATE "scenes" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;
UPDATE "shots" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;
UPDATE "shot_contents" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;
UPDATE "frames" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;

ALTER TABLE "characters" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "characters" ALTER COLUMN "created_by_name" SET NOT NULL;
ALTER TABLE "taps" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "taps" ALTER COLUMN "created_by_name" SET NOT NULL;
ALTER TABLE "scenes" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "scenes" ALTER COLUMN "created_by_name" SET NOT NULL;
ALTER TABLE "shots" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "shots" ALTER COLUMN "created_by_name" SET NOT NULL;
ALTER TABLE "shot_contents" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "shot_contents" ALTER COLUMN "created_by_name" SET NOT NULL;
ALTER TABLE "frames" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "frames" ALTER COLUMN "created_by_name" SET NOT NULL;
