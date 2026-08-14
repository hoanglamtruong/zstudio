-- Add ownership tracking (created_by_id/name) to projects, so a project can
-- be deleted by its creator or a leader. Existing rows are backfilled to the
-- leader user (id 1).

ALTER TABLE "projects" ADD COLUMN "created_by_id" INTEGER;
ALTER TABLE "projects" ADD COLUMN "created_by_name" TEXT;

UPDATE "projects" SET "created_by_id" = 1, "created_by_name" = 'Đạo diễn Lam' WHERE "created_by_id" IS NULL;

ALTER TABLE "projects" ALTER COLUMN "created_by_id" SET NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "created_by_name" SET NOT NULL;
