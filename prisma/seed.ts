import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const leader = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Đạo diễn Lam",
      isLeader: true,
      permissions: [],
    },
  });

  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Biên kịch An",
      isLeader: false,
      permissions: ["nhanvat", "tapinfo", "thoai"],
    },
  });

  const project = await prisma.project.create({
    data: { title: "Dự án mẫu — Hành Trình" },
  });

  await prisma.character.createMany({
    data: [
      { projectId: project.id, name: "Minh", desc: "Nhân vật chính, 25 tuổi, đạo diễn trẻ." },
      { projectId: project.id, name: "Lan", desc: "Bạn thân của Minh, biên kịch." },
    ],
  });

  const tap = await prisma.tap.create({
    data: {
      projectId: project.id,
      title: "Tập 1: Khởi Đầu",
      summary: "Minh nhận dự án đầu tiên trong sự nghiệp.",
      locations: ["Văn phòng", "Quán cà phê"],
      equipment: ["Máy quay chính", "Chân máy"],
      costumes: ["Áo sơ mi xanh"],
      order: 1,
    },
  });

  const scene = await prisma.scene.create({
    data: {
      tapId: tap.id,
      title: "Cảnh 1: Cuộc gặp",
      space: "Quán cà phê",
      time: "Buổi sáng",
      charactersPresent: ["Minh", "Lan"],
      order: 1,
    },
  });

  const shot = await prisma.shot.create({
    data: {
      sceneId: scene.id,
      title: "Shot 1: Minh bước vào quán",
      angle: "eye-level",
      movement: "dolly",
      order: 1,
    },
  });

  await prisma.shotContent.createMany({
    data: [
      { shotId: shot.id, type: "HANHDONG", character: "Minh", text: "Minh đẩy cửa bước vào, nhìn quanh tìm Lan.", order: 1 },
      { shotId: shot.id, type: "THOAI", character: "Minh", text: "Xin lỗi, tôi đến trễ!", order: 2 },
    ],
  });

  await prisma.frame.create({
    data: {
      shotId: shot.id,
      imageUrl: "https://placehold.co/640x360?text=Frame+1",
      order: 1,
    },
  });

  console.log("Seed done. Leader user id:", leader.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
