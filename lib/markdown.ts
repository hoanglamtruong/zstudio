import { CAMERA_ANGLES, CAMERA_MOVEMENTS } from "@/lib/cameraData";

type ShotContentLike = { type: string; character: string; text: string; order: number; active: boolean };
type ShotLike = {
  title: string;
  angle: string;
  movement: string;
  order: number;
  active: boolean;
  contents: ShotContentLike[];
};
type SceneLike = {
  title: string;
  space: string;
  time: string;
  charactersPresent: string[];
  order: number;
  active: boolean;
  shots: ShotLike[];
};
type TapLike = {
  title: string;
  summary: string;
  locations: string[];
  equipment: string[];
  costumes: string[];
  order: number;
  active: boolean;
  scenes: SceneLike[];
};
type CharacterLike = { name: string; desc: string; active: boolean };
type ProjectLike = { title: string; mainPlot: string; characters: CharacterLike[]; taps: TapLike[] };

const CONTENT_LABEL: Record<string, string> = {
  HANHDONG: "Hành động",
  THOAI: "Thoại",
  AMTHANH: "Âm thanh",
  ANHSANG: "Ánh sáng",
};

function angleLabel(key: string): string {
  return CAMERA_ANGLES.find((a) => a.key === key)?.vi ?? key;
}

function movementLabel(key: string): string {
  return CAMERA_MOVEMENTS.find((m) => m.key === key)?.vi ?? key;
}

// Đối tượng bị ẩn (active=false) không xuất hiện trong Markdown/Xem trước.
export function generateMarkdown(project: ProjectLike): string {
  const lines: string[] = [];
  lines.push(`# ${project.title}`, "");

  if (project.mainPlot) {
    lines.push("## Cốt truyện chính", "", project.mainPlot, "");
  }

  const characters = project.characters.filter((c) => c.active);
  if (characters.length > 0) {
    lines.push("## Nhân vật", "");
    for (const c of [...characters].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`- **${c.name}**: ${c.desc}`);
    }
    lines.push("");
  }

  const taps = project.taps.filter((t) => t.active).sort((a, b) => a.order - b.order);
  for (const tap of taps) {
    lines.push(`## TẬP: ${tap.title}`, "");
    if (tap.summary) lines.push(`${tap.summary}`, "");
    if (tap.locations.length) lines.push(`- Bối cảnh: ${tap.locations.join(", ")}`);
    if (tap.equipment.length) lines.push(`- Thiết bị: ${tap.equipment.join(", ")}`);
    if (tap.costumes.length) lines.push(`- Trang phục: ${tap.costumes.join(", ")}`);
    lines.push("");

    const scenes = tap.scenes.filter((s) => s.active).sort((a, b) => a.order - b.order);
    for (const scene of scenes) {
      lines.push(`### Cảnh: ${scene.title}`, "");
      lines.push(`*Không gian: ${scene.space} — Thời gian: ${scene.time}*`);
      if (scene.charactersPresent.length) lines.push(`*Nhân vật: ${scene.charactersPresent.join(", ")}*`);
      lines.push("");

      const shots = scene.shots.filter((s) => s.active).sort((a, b) => a.order - b.order);
      for (const shot of shots) {
        lines.push(`#### Shot: ${shot.title}`);
        lines.push(`*Góc máy: ${angleLabel(shot.angle)} — Chuyển động: ${movementLabel(shot.movement)}*`, "");

        const contents = shot.contents.filter((c) => c.active).sort((a, b) => a.order - b.order);
        for (const content of contents) {
          const label = CONTENT_LABEL[content.type] ?? content.type;
          const who = content.character ? ` (${content.character})` : "";
          lines.push(`- **${label}${who}**: ${content.text}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}
