"use client";

import { useEffect, useState } from "react";
import { canModify, hasPermission, PermissionModule, SHOT_CONTENT_TYPE_TO_MODULE } from "@/lib/permissions";
import { ApiUser, Character, CommentTarget, Project, Scene, Shot, ShotContent, ShotContentType, Tap } from "@/lib/types";
import CommentModal from "./CommentModal";
import CameraPickerModal from "./CameraPickerModal";
import ExpandableTextArea from "./ExpandableTextArea";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS } from "@/lib/cameraData";

type CommentTargetState = { type: CommentTarget; id: number; label: string } | null;
type CanFn = (m: PermissionModule) => boolean;
type CanModFn = (m: PermissionModule, createdById: number) => boolean;
type Fetcher = (url: string, body: unknown) => Promise<boolean>;
type Deleter = (url: string) => Promise<boolean>;

const CONTENT_TYPES: { type: ShotContentType; label: string }[] = [
  { type: "HANHDONG", label: "Hành động" },
  { type: "THOAI", label: "Thoại" },
  { type: "AMTHANH", label: "Âm thanh" },
  { type: "ANHSANG", label: "Ánh sáng" },
];

function angleLabel(key: string) {
  return CAMERA_ANGLES.find((a) => a.key === key)?.vi ?? (key || "—");
}
function movementLabel(key: string) {
  return CAMERA_MOVEMENTS.find((m) => m.key === key)?.vi ?? (key || "—");
}

// Thanh hành động dùng chung: Bình luận (ai cũng bấm được) + Ẩn/Hiện + Xóa
// (chỉ hiện nếu canMod true — leader luôn true, staff chỉ true trên đối tượng do mình tạo).
function ItemActions({
  active,
  canMod,
  onToggleActive,
  onDelete,
  onComment,
  confirmLabel,
}: {
  active: boolean;
  canMod: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
  onComment: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0 text-xs">
      {!active && <span className="px-1.5 py-0.5 rounded bg-dark-purple opacity-70">Đã ẩn</span>}
      <button onClick={onComment} className="text-ultra-violet hover:text-saffron underline">
        💬 Bình luận
      </button>
      {canMod && (
        <>
          <button onClick={onToggleActive} className="text-ultra-violet hover:text-saffron underline">
            {active ? "Ẩn" : "Hiện"}
          </button>
          <button
            onClick={() => confirm(`Xóa hẳn "${confirmLabel}"? Không thể hoàn tác.`) && onDelete()}
            className="text-red-400 hover:text-red-300 underline"
          >
            Xóa
          </button>
        </>
      )}
    </div>
  );
}

export default function ProjectEditor({ projectId, user }: { projectId: number; user: ApiUser }) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<"soan" | "preview">("soan");
  const [commentTarget, setCommentTarget] = useState<CommentTargetState>(null);
  const [cameraFor, setCameraFor] = useState<Shot | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [loadingMd, setLoadingMd] = useState(false);

  function load() {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setProject(data.project ?? null));
  }

  useEffect(load, [projectId]);

  function openPreview() {
    setTab("preview");
    setLoadingMd(true);
    fetch(`/api/export/${projectId}`)
      .then((r) => r.text())
      .then(setMarkdown)
      .finally(() => setLoadingMd(false));
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Thao tác thất bại");
    }
    return res.ok;
  }

  async function patch(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Thao tác thất bại");
    }
    return res.ok;
  }

  async function del(url: string) {
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Xóa thất bại");
    }
    return res.ok;
  }

  async function copyMarkdown() {
    const res = await fetch(`/api/export/${projectId}`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    alert("Đã copy Markdown vào clipboard.");
  }

  if (!project) return <p className="px-6 py-8 opacity-70">Đang tải dự án...</p>;

  const can: CanFn = (m) => hasPermission(user, m);
  const canMod: CanModFn = (m, createdById) => canModify(user, m, createdById);

  return (
    <main className="flex-1 px-6 py-6 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-saffron mb-1">{project.title}</h1>

      <div className="flex gap-2 my-4 border-b border-ultra-violet">
        <button
          onClick={() => setTab("soan")}
          className={`px-4 py-2 ${tab === "soan" ? "border-b-2 border-saffron text-saffron" : "opacity-60"}`}
        >
          Soạn
        </button>
        <button
          onClick={openPreview}
          className={`px-4 py-2 ${tab === "preview" ? "border-b-2 border-saffron text-saffron" : "opacity-60"}`}
        >
          Xem trước
        </button>
      </div>

      {tab === "preview" ? (
        <section>
          <div className="flex gap-2 mb-4">
            <a
              href={`/api/export/${projectId}`}
              download
              className="px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold text-sm"
            >
              Tải Markdown
            </a>
            <button onClick={copyMarkdown} className="px-4 py-2 rounded-md bg-ultra-violet text-sm">
              Copy Markdown
            </button>
          </div>
          {loadingMd ? (
            <p className="opacity-70 text-sm">Đang tải...</p>
          ) : (
            <pre className="bg-dark-green rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">{markdown}</pre>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-8">
          <MainPlotSection project={project} can={can} patch={patch} />
          <CharacterSection
            project={project}
            can={can}
            canMod={canMod}
            post={post}
            patch={patch}
            del={del}
            openComment={setCommentTarget}
          />
          <TapSection
            project={project}
            can={can}
            canMod={canMod}
            user={user}
            post={post}
            patch={patch}
            del={del}
            openComment={setCommentTarget}
            openCamera={setCameraFor}
          />
        </section>
      )}

      {commentTarget && (
        <CommentModal
          targetType={commentTarget.type}
          targetId={commentTarget.id}
          label={commentTarget.label}
          onClose={() => setCommentTarget(null)}
        />
      )}

      {cameraFor && (
        <CameraPickerModal
          initialAngle={cameraFor.angle}
          initialMovement={cameraFor.movement}
          onClose={() => setCameraFor(null)}
          onConfirm={async (angle, movement) => {
            await patch(`/api/shots/${cameraFor.id}`, { angle, movement });
            setCameraFor(null);
          }}
        />
      )}
    </main>
  );
}

// ───────────────────────────── Cốt truyện chính ─────────────────────────────

function MainPlotSection({ project, can, patch }: { project: Project; can: CanFn; patch: Fetcher }) {
  const editable = can("tapinfo");

  return (
    <div>
      <h2 className="text-lg font-semibold text-saffron mb-2">Cốt truyện chính</h2>
      <ExpandableTextArea
        value={project.mainPlot}
        disabled={!editable}
        onSave={(v) => patch(`/api/projects/${project.id}`, { mainPlot: v })}
        rows={5}
        placeholder="Tóm tắt cốt truyện tổng thể của dự án..."
        title="Cốt truyện chính"
      />
    </div>
  );
}

// ───────────────────────────── Nhân vật ─────────────────────────────

function CharacterSection({
  project,
  can,
  canMod,
  post,
  patch,
  del,
  openComment,
}: {
  project: Project;
  can: CanFn;
  canMod: CanModFn;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
  openComment: (t: CommentTargetState) => void;
}) {
  const [name, setName] = useState("");
  const canCreate = can("nhanvat");
  const visible = project.characters.filter((c) => c.active || canMod("nhanvat", c.createdById));

  return (
    <div>
      <h2 className="text-lg font-semibold text-saffron mb-2">Nhân vật</h2>
      <div className="flex flex-col gap-2 mb-3">
        {visible.map((c: Character) => {
          const editable = canMod("nhanvat", c.createdById);
          return (
            <div key={c.id} className={`bg-dark-green rounded-md p-3 flex flex-col gap-1 ${!c.active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <ExpandableTextArea
                    value={c.name}
                    disabled={!editable}
                    onSave={(v) => patch(`/api/characters/${c.id}`, { name: v })}
                    rows={1}
                    className="font-medium"
                    title="Tên nhân vật"
                  />
                </div>
                <ItemActions
                  active={c.active}
                  canMod={editable}
                  confirmLabel={c.name}
                  onComment={() => openComment({ type: "CHARACTER", id: c.id, label: c.name })}
                  onToggleActive={() => patch(`/api/characters/${c.id}`, { active: !c.active })}
                  onDelete={() => del(`/api/characters/${c.id}`)}
                />
              </div>
              <ExpandableTextArea
                value={c.desc}
                disabled={!editable}
                onSave={(v) => patch(`/api/characters/${c.id}`, { desc: v })}
                rows={2}
                placeholder="Mô tả nhân vật..."
                title={`Mô tả nhân vật — ${c.name}`}
              />
              <span className="text-[11px] opacity-50">Tạo bởi {c.createdByName}</span>
            </div>
          );
        })}
      </div>
      {canCreate && (
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên nhân vật mới..." className="flex-1" />
          <button
            onClick={async () => {
              if (!name.trim()) return;
              if (await post("/api/characters", { projectId: project.id, name })) setName("");
            }}
            className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold text-sm"
          >
            + Nhân vật
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Tập / Cảnh / Shot ─────────────────────────────

function TapSection({
  project,
  can,
  canMod,
  user,
  post,
  patch,
  del,
  openComment,
  openCamera,
}: {
  project: Project;
  can: CanFn;
  canMod: CanModFn;
  user: ApiUser;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const [title, setTitle] = useState("");
  const visibleTaps = project.taps.filter((t) => t.active || user.isLeader);

  return (
    <div>
      <h2 className="text-lg font-semibold text-saffron mb-2">Tập</h2>
      <div className="flex flex-col gap-5">
        {visibleTaps.map((tap: Tap) => (
          <TapItem
            key={tap.id}
            tap={tap}
            can={can}
            canMod={canMod}
            isLeader={user.isLeader}
            post={post}
            patch={patch}
            del={del}
            openComment={openComment}
            openCamera={openCamera}
          />
        ))}
      </div>
      {user.isLeader && (
        <div className="flex gap-2 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên Tập mới..." className="flex-1" />
          <button
            onClick={async () => {
              if (!title.trim()) return;
              if (await post("/api/taps", { projectId: project.id, title })) setTitle("");
            }}
            className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold text-sm"
          >
            + Tập (Leader)
          </button>
        </div>
      )}
    </div>
  );
}

function TapItem({
  tap,
  can,
  canMod,
  isLeader,
  post,
  patch,
  del,
  openComment,
  openCamera,
}: {
  tap: Tap;
  can: CanFn;
  canMod: CanModFn;
  isLeader: boolean;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = can("tapinfo");
  const [sceneTitle, setSceneTitle] = useState("");
  const visibleScenes = tap.scenes.filter((s) => s.active || canMod("canh", s.createdById));

  return (
    <div className={`bg-dark-green rounded-lg p-4 ${!tap.active ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <ExpandableTextArea
            value={tap.title}
            disabled={!editable}
            onSave={(v) => patch(`/api/taps/${tap.id}`, { title: v })}
            rows={1}
            className="font-semibold"
            title="Tên Tập"
          />
        </div>
        {/* Ẩn/Xóa Tập là thao tác cấu trúc: chỉ leader (giống add Tập). */}
        <ItemActions
          active={tap.active}
          canMod={isLeader}
          confirmLabel={tap.title}
          onComment={() => openComment({ type: "TAP", id: tap.id, label: tap.title })}
          onToggleActive={() => patch(`/api/taps/${tap.id}`, { active: !tap.active })}
          onDelete={() => del(`/api/taps/${tap.id}`)}
        />
      </div>
      <ExpandableTextArea
        value={tap.summary}
        disabled={!editable}
        onSave={(v) => patch(`/api/taps/${tap.id}`, { summary: v })}
        rows={2}
        placeholder="Tóm tắt Tập..."
        className="mb-2"
        title={`Tóm tắt Tập — ${tap.title}`}
      />
      <ListEditor
        label="Bối cảnh"
        values={tap.locations}
        disabled={!editable}
        onChange={(v) => patch(`/api/taps/${tap.id}`, { locations: v })}
      />
      <ListEditor
        label="Thiết bị"
        values={tap.equipment}
        disabled={!editable}
        onChange={(v) => patch(`/api/taps/${tap.id}`, { equipment: v })}
      />
      <ListEditor
        label="Trang phục"
        values={tap.costumes}
        disabled={!editable}
        onChange={(v) => patch(`/api/taps/${tap.id}`, { costumes: v })}
      />
      <span className="text-[11px] opacity-50">Tạo bởi {tap.createdByName}</span>

      <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-ultra-violet">
        {visibleScenes.map((scene: Scene) => (
          <SceneItem
            key={scene.id}
            scene={scene}
            can={can}
            canMod={canMod}
            post={post}
            patch={patch}
            del={del}
            openComment={openComment}
            openCamera={openCamera}
          />
        ))}
      </div>

      {can("canh") && (
        <div className="flex gap-2 mt-3">
          <input value={sceneTitle} onChange={(e) => setSceneTitle(e.target.value)} placeholder="Tên Cảnh mới..." className="flex-1 text-sm" />
          <button
            onClick={async () => {
              if (!sceneTitle.trim()) return;
              if (await post("/api/scenes", { tapId: tap.id, title: sceneTitle })) setSceneTitle("");
            }}
            className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold text-sm"
          >
            + Cảnh
          </button>
        </div>
      )}
    </div>
  );
}

function SceneItem({
  scene,
  can,
  canMod,
  post,
  patch,
  del,
  openComment,
  openCamera,
}: {
  scene: Scene;
  can: CanFn;
  canMod: CanModFn;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = canMod("canh", scene.createdById);
  const [shotTitle, setShotTitle] = useState("");
  const visibleShots = scene.shots.filter((s) => s.active || canMod("shot", s.createdById));

  return (
    <div className={`bg-dark-purple rounded-md p-3 ${!scene.active ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <ExpandableTextArea
            value={scene.title}
            disabled={!editable}
            onSave={(v) => patch(`/api/scenes/${scene.id}`, { title: v })}
            rows={1}
            className="font-medium text-sm"
            title="Tên Cảnh"
          />
        </div>
        <ItemActions
          active={scene.active}
          canMod={editable}
          confirmLabel={scene.title}
          onComment={() => openComment({ type: "SCENE", id: scene.id, label: scene.title })}
          onToggleActive={() => patch(`/api/scenes/${scene.id}`, { active: !scene.active })}
          onDelete={() => del(`/api/scenes/${scene.id}`)}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <ExpandableTextArea
            value={scene.space}
            disabled={!editable}
            onSave={(v) => patch(`/api/scenes/${scene.id}`, { space: v })}
            rows={1}
            className="text-sm"
            placeholder="Không gian"
            title="Không gian"
          />
        </div>
        <div className="flex-1 min-w-0">
          <ExpandableTextArea
            value={scene.time}
            disabled={!editable}
            onSave={(v) => patch(`/api/scenes/${scene.id}`, { time: v })}
            rows={1}
            className="text-sm"
            placeholder="Thời gian"
            title="Thời gian"
          />
        </div>
      </div>
      <ListEditor
        label="Nhân vật có mặt"
        values={scene.charactersPresent}
        disabled={!editable}
        onChange={(v) => patch(`/api/scenes/${scene.id}`, { charactersPresent: v })}
      />
      <span className="text-[11px] opacity-50">Tạo bởi {scene.createdByName}</span>

      <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-ultra-violet">
        {visibleShots.map((shot: Shot) => (
          <ShotItem key={shot.id} shot={shot} can={can} canMod={canMod} post={post} patch={patch} del={del} openComment={openComment} openCamera={openCamera} />
        ))}
      </div>

      {can("shot") && (
        <div className="flex gap-2 mt-3">
          <input value={shotTitle} onChange={(e) => setShotTitle(e.target.value)} placeholder="Tên Shot mới..." className="flex-1 text-sm" />
          <button
            onClick={async () => {
              if (!shotTitle.trim()) return;
              if (await post("/api/shots", { sceneId: scene.id, title: shotTitle })) setShotTitle("");
            }}
            className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold text-sm"
          >
            + Shot
          </button>
        </div>
      )}
    </div>
  );
}

function ShotItem({
  shot,
  can,
  canMod,
  post,
  patch,
  del,
  openComment,
  openCamera,
}: {
  shot: Shot;
  can: CanFn;
  canMod: CanModFn;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = canMod("shot", shot.createdById);

  return (
    <div className={`bg-dark-green rounded-md p-3 ${!shot.active ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <ExpandableTextArea
            value={shot.title}
            disabled={!editable}
            onSave={(v) => patch(`/api/shots/${shot.id}`, { title: v })}
            rows={1}
            className="font-medium text-sm"
            title="Tên Shot"
          />
        </div>
        <ItemActions
          active={shot.active}
          canMod={editable}
          confirmLabel={shot.title}
          onComment={() => openComment({ type: "SHOT", id: shot.id, label: shot.title })}
          onToggleActive={() => patch(`/api/shots/${shot.id}`, { active: !shot.active })}
          onDelete={() => del(`/api/shots/${shot.id}`)}
        />
      </div>

      <button
        disabled={!editable}
        onClick={() => openCamera(shot)}
        className="text-xs px-2 py-1 rounded bg-ultra-violet mb-2 disabled:opacity-50"
      >
        🎥 {angleLabel(shot.angle)} · {movementLabel(shot.movement)}
      </button>
      <div className="text-[11px] opacity-50 mb-2">Tạo bởi {shot.createdByName}</div>

      <ShotContentSection shot={shot} can={can} canMod={canMod} post={post} patch={patch} del={del} />
      <FrameSection shot={shot} can={can} canMod={canMod} post={post} patch={patch} del={del} />
    </div>
  );
}

function ShotContentSection({
  shot,
  can,
  canMod,
  post,
  patch,
  del,
}: {
  shot: Shot;
  can: CanFn;
  canMod: CanModFn;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
}) {
  const [drafts, setDrafts] = useState<Record<ShotContentType, string>>({
    HANHDONG: "",
    THOAI: "",
    AMTHANH: "",
    ANHSANG: "",
  });

  const grouped: Record<ShotContentType, ShotContent[]> = {
    HANHDONG: [],
    THOAI: [],
    AMTHANH: [],
    ANHSANG: [],
  };
  for (const c of shot.contents) grouped[c.type].push(c);

  return (
    <div className="flex flex-col gap-2 mb-3">
      {CONTENT_TYPES.map(({ type, label }) => {
        const mod = SHOT_CONTENT_TYPE_TO_MODULE[type];
        const canCreate = can(mod);
        const visibleContents = grouped[type].filter((c) => c.active || canMod(mod, c.createdById));
        return (
          <div key={type}>
            <div className="text-xs font-semibold text-ultra-violet mb-1">{label}</div>
            <div className="flex flex-col gap-1 mb-1">
              {visibleContents.map((c) => {
                const editable = canMod(mod, c.createdById);
                return (
                  <div key={c.id} className={`flex items-start gap-2 ${!c.active ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <ExpandableTextArea
                        value={c.text}
                        disabled={!editable}
                        onSave={(v) => patch(`/api/shot-contents/${c.id}`, { text: v })}
                        rows={1}
                        className="text-sm"
                        title={label}
                      />
                    </div>
                    {editable && (
                      <div className="flex gap-1 text-xs shrink-0 pt-1.5">
                        <button
                          onClick={() => patch(`/api/shot-contents/${c.id}`, { active: !c.active })}
                          className="text-ultra-violet hover:text-saffron underline"
                        >
                          {c.active ? "Ẩn" : "Hiện"}
                        </button>
                        <button
                          onClick={() => confirm("Xóa dòng này?") && del(`/api/shot-contents/${c.id}`)}
                          className="text-red-400 hover:text-red-300 underline"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {canCreate && (
              <div className="flex gap-2">
                <input
                  value={drafts[type]}
                  onChange={(e) => setDrafts((d) => ({ ...d, [type]: e.target.value }))}
                  placeholder={`Thêm ${label.toLowerCase()}...`}
                  className="flex-1 text-sm"
                />
                <button
                  onClick={async () => {
                    if (!drafts[type].trim()) return;
                    if (await post("/api/shot-contents", { shotId: shot.id, type, text: drafts[type] })) {
                      setDrafts((d) => ({ ...d, [type]: "" }));
                    }
                  }}
                  className="px-2 py-1 rounded bg-saffron text-dark-purple text-xs font-semibold"
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FrameSection({
  shot,
  can,
  canMod,
  post,
  patch,
  del,
}: {
  shot: Shot;
  can: CanFn;
  canMod: CanModFn;
  post: Fetcher;
  patch: Fetcher;
  del: Deleter;
}) {
  const [url, setUrl] = useState("");
  const canCreate = can("shot");
  const visibleFrames = shot.frames.filter((f) => f.active || canMod("shot", f.createdById));

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div>
      <div className="text-xs font-semibold text-ultra-violet mb-1">Frame (storyboard)</div>
      <div className="flex gap-2 flex-wrap mb-2">
        {visibleFrames.map((f) => {
          const editable = canMod("shot", f.createdById);
          return (
            <div key={f.id} className={`relative ${!f.active ? "opacity-50" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.imageUrl} alt={`Frame ${f.order}`} className="w-24 h-16 object-cover rounded border border-ultra-violet" />
              {editable && (
                <div className="absolute -top-1 -right-1 flex gap-0.5">
                  <button
                    onClick={() => patch(`/api/frames/${f.id}`, { active: !f.active })}
                    title={f.active ? "Ẩn" : "Hiện"}
                    className="w-4 h-4 leading-4 text-[10px] rounded-full bg-ultra-violet"
                  >
                    {f.active ? "−" : "+"}
                  </button>
                  <button
                    onClick={() => confirm("Xóa frame này?") && del(`/api/frames/${f.id}`)}
                    title="Xóa"
                    className="w-4 h-4 leading-4 text-[10px] rounded-full bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {canCreate && (
        <div className="flex gap-2 items-center">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL ảnh..." className="flex-1 text-sm" />
          <button
            onClick={async () => {
              if (!url.trim()) return;
              if (await post("/api/frames", { shotId: shot.id, imageUrl: url })) setUrl("");
            }}
            className="px-2 py-1 rounded bg-saffron text-dark-purple text-xs font-semibold"
          >
            + URL
          </button>
          <input
            type="file"
            accept="image/*"
            className="text-xs w-32"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file);
              await post("/api/frames", { shotId: shot.id, imageUrl: dataUrl });
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}

function ListEditor({
  label,
  values,
  disabled,
  onChange,
}: {
  label: string;
  values: string[];
  disabled: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="mb-2">
      <div className="text-xs opacity-70 mb-1">{label} (phân cách bởi dấu phẩy)</div>
      <ExpandableTextArea
        value={values.join(", ")}
        disabled={disabled}
        rows={1}
        className="text-sm"
        title={label}
        onSave={(text) => {
          const v = text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange(v);
        }}
      />
    </div>
  );
}
