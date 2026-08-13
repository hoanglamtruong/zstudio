-- CreateEnum
CREATE TYPE "CommentTarget" AS ENUM ('CHARACTER', 'TAP', 'SCENE', 'SHOT');

-- CreateEnum
CREATE TYPE "ShotContentType" AS ENUM ('HANHDONG', 'THOAI', 'AMTHANH', 'ANHSANG');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taps" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "costumes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "taps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenes" (
    "id" SERIAL NOT NULL,
    "tap_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "space" TEXT NOT NULL DEFAULT '',
    "time" TEXT NOT NULL DEFAULT '',
    "characters_present" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shots" (
    "id" SERIAL NOT NULL,
    "scene_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "angle" TEXT NOT NULL DEFAULT '',
    "movement" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shot_contents" (
    "id" SERIAL NOT NULL,
    "shot_id" INTEGER NOT NULL,
    "type" "ShotContentType" NOT NULL,
    "character" TEXT NOT NULL DEFAULT '',
    "text" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shot_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frames" (
    "id" SERIAL NOT NULL,
    "shot_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "frames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "target_type" "CommentTarget" NOT NULL,
    "target_id" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characters_project_id_idx" ON "characters"("project_id");

-- CreateIndex
CREATE INDEX "taps_project_id_idx" ON "taps"("project_id");

-- CreateIndex
CREATE INDEX "scenes_tap_id_idx" ON "scenes"("tap_id");

-- CreateIndex
CREATE INDEX "shots_scene_id_idx" ON "shots"("scene_id");

-- CreateIndex
CREATE INDEX "shot_contents_shot_id_idx" ON "shot_contents"("shot_id");

-- CreateIndex
CREATE INDEX "frames_shot_id_idx" ON "frames"("shot_id");

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taps" ADD CONSTRAINT "taps_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_tap_id_fkey" FOREIGN KEY ("tap_id") REFERENCES "taps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shots" ADD CONSTRAINT "shots_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shot_contents" ADD CONSTRAINT "shot_contents_shot_id_fkey" FOREIGN KEY ("shot_id") REFERENCES "shots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frames" ADD CONSTRAINT "frames_shot_id_fkey" FOREIGN KEY ("shot_id") REFERENCES "shots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
