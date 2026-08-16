-- Replace the Leader/Staff boolean with a 3-tier Role (MANAGER/ADMIN/STAFF),
-- and add an `approved` flag so self-registered accounts wait for a Manager
-- to approve them before they can log in. Existing users are backfilled to
-- MANAGER (was leader) / STAFF (was not) and marked approved (they already
-- existed before this flow).

CREATE TYPE "Role" AS ENUM ('MANAGER', 'ADMIN', 'STAFF');

ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'STAFF';
UPDATE "users" SET "role" = 'MANAGER' WHERE "isLeader" = true;
ALTER TABLE "users" DROP COLUMN "isLeader";

ALTER TABLE "users" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT true;
