"use client";

import { useEffect, useState } from "react";
import { hasPermission, PermissionModule, SHOT_CONTENT_TYPE_TO_MODULE } from "@/lib/permissions";
import { ApiUser, Character, CommentTarget, Project, Scene, Shot, ShotContent, ShotContentType, Tap } from "@/lib/types";
import CommentModal from "./CommentModal";
import CameraPickerModal from "./CameraPickerModal";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS } from "@/lib/cameraData";

type CommentTargetState = { type: CommentTarget; id: number; label: string } | null;

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

function CommentButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs text-ultra-violet hover:text-saffron underline shrink-0">
      💬 Bình luận
    </button>
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

  async function copyMarkdown() {
    const res = await fetch(`/api/export/${projectId}`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    alert("Đã copy Markdown vào clipboard.");
  }

  if (!project) return <p className="px-6 py-8 opacity-70">Đang tải dự án...</p>;

  const can = (m: PermissionModule) => hasPermission(user, m);

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
          <CharacterSection project={project} can={can} post={post} patch={patch} openComment={setCommentTarget} />
          <TapSection project={project} can={can} user={user} post={post} patch={patch} openComment={setCommentTarget} openCamera={setCameraFor} />
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

// ───────────────────────────── Nhân vật ─────────────────────────────

function CharacterSection({
  project,
  can,
  post,
  patch,
  openComment,
}: {
  project: Project;
  can: (m: PermissionModule) => boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
  openComment: (t: CommentTargetState) => void;
}) {
  const [name, setName] = useState("");
  const editable = can("nhanvat");

  return (
    <div>
      <h2 className="text-lg font-semibold text-saffron mb-2">Nhân vật</h2>
      <div className="flex flex-col gap-2 mb-3">
        {project.characters.map((c: Character) => (
          <div key={c.id} className="bg-dark-green rounded-md p-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                defaultValue={c.name}
                disabled={!editable}
                onBlur={(e) => e.target.value !== c.name && patch(`/api/characters/${c.id}`, { name: e.target.value })}
                className="font-medium flex-1"
              />
              <CommentButton onClick={() => openComment({ type: "CHARACTER", id: c.id, label: c.name })} />
            </div>
            <textarea
              defaultValue={c.desc}
              disabled={!editable}
              onBlur={(e) => e.target.value !== c.desc && patch(`/api/characters/${c.id}`, { desc: e.target.value })}
              rows={2}
              placeholder="Mô tả nhân vật..."
            />
          </div>
        ))}
      </div>
      {editable && (
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
  user,
  post,
  patch,
  openComment,
  openCamera,
}: {
  project: Project;
  can: (m: PermissionModule) => boolean;
  user: ApiUser;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold text-saffron mb-2">Tập</h2>
      <div className="flex flex-col gap-5">
        {project.taps.map((tap: Tap) => (
          <TapItem key={tap.id} tap={tap} can={can} post={post} patch={patch} openComment={openComment} openCamera={openCamera} />
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
  post,
  patch,
  openComment,
  openCamera,
}: {
  tap: Tap;
  can: (m: PermissionModule) => boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = can("tapinfo");
  const [sceneTitle, setSceneTitle] = useState("");

  return (
    <div className="bg-dark-green rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <input
          defaultValue={tap.title}
          disabled={!editable}
          onBlur={(e) => e.target.value !== tap.title && patch(`/api/taps/${tap.id}`, { title: e.target.value })}
          className="font-semibold flex-1"
        />
        <CommentButton onClick={() => openComment({ type: "TAP", id: tap.id, label: tap.title })} />
      </div>
      <textarea
        defaultValue={tap.summary}
        disabled={!editable}
        onBlur={(e) => e.target.value !== tap.summary && patch(`/api/taps/${tap.id}`, { summary: e.target.value })}
        rows={2}
        placeholder="Tóm tắt Tập..."
        className="w-full mb-2"
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

      <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-ultra-violet">
        {tap.scenes.map((scene: Scene) => (
          <SceneItem key={scene.id} scene={scene} can={can} post={post} patch={patch} openComment={openComment} openCamera={openCamera} />
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
  post,
  patch,
  openComment,
  openCamera,
}: {
  scene: Scene;
  can: (m: PermissionModule) => boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = can("canh");
  const [shotTitle, setShotTitle] = useState("");

  return (
    <div className="bg-dark-purple rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <input
          defaultValue={scene.title}
          disabled={!editable}
          onBlur={(e) => e.target.value !== scene.title && patch(`/api/scenes/${scene.id}`, { title: e.target.value })}
          className="font-medium flex-1 text-sm"
        />
        <CommentButton onClick={() => openComment({ type: "SCENE", id: scene.id, label: scene.title })} />
      </div>
      <div className="flex gap-2 mb-2">
        <input
          defaultValue={scene.space}
          disabled={!editable}
          onBlur={(e) => e.target.value !== scene.space && patch(`/api/scenes/${scene.id}`, { space: e.target.value })}
          placeholder="Không gian"
          className="flex-1 text-sm"
        />
        <input
          defaultValue={scene.time}
          disabled={!editable}
          onBlur={(e) => e.target.value !== scene.time && patch(`/api/scenes/${scene.id}`, { time: e.target.value })}
          placeholder="Thời gian"
          className="flex-1 text-sm"
        />
      </div>
      <ListEditor
        label="Nhân vật có mặt"
        values={scene.charactersPresent}
        disabled={!editable}
        onChange={(v) => patch(`/api/scenes/${scene.id}`, { charactersPresent: v })}
      />

      <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-ultra-violet">
        {scene.shots.map((shot: Shot) => (
          <ShotItem key={shot.id} shot={shot} can={can} post={post} patch={patch} openComment={openComment} openCamera={openCamera} />
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
  post,
  patch,
  openComment,
  openCamera,
}: {
  shot: Shot;
  can: (m: PermissionModule) => boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
  openComment: (t: CommentTargetState) => void;
  openCamera: (s: Shot) => void;
}) {
  const editable = can("shot");

  return (
    <div className="bg-dark-green rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <input
          defaultValue={shot.title}
          disabled={!editable}
          onBlur={(e) => e.target.value !== shot.title && patch(`/api/shots/${shot.id}`, { title: e.target.value })}
          className="font-medium flex-1 text-sm"
        />
        <CommentButton onClick={() => openComment({ type: "SHOT", id: shot.id, label: shot.title })} />
      </div>

      <button
        disabled={!editable}
        onClick={() => openCamera(shot)}
        className="text-xs px-2 py-1 rounded bg-ultra-violet mb-3 disabled:opacity-50"
      >
        🎥 {angleLabel(shot.angle)} · {movementLabel(shot.movement)}
      </button>

      <ShotContentSection shot={shot} can={can} post={post} patch={patch} />
      <FrameSection shot={shot} editable={editable} post={post} />
    </div>
  );
}

function ShotContentSection({
  shot,
  can,
  post,
  patch,
}: {
  shot: Shot;
  can: (m: PermissionModule) => boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
  patch: (url: string, body: unknown) => Promise<boolean>;
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
        const editable = can(mod);
        return (
          <div key={type}>
            <div className="text-xs font-semibold text-ultra-violet mb-1">{label}</div>
            <div className="flex flex-col gap-1 mb-1">
              {grouped[type].map((c) => (
                <textarea
                  key={c.id}
                  defaultValue={c.text}
                  disabled={!editable}
                  onBlur={(e) => e.target.value !== c.text && patch(`/api/shot-contents/${c.id}`, { text: e.target.value })}
                  rows={1}
                  className="text-sm"
                />
              ))}
            </div>
            {editable && (
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
  editable,
  post,
}: {
  shot: Shot;
  editable: boolean;
  post: (url: string, body: unknown) => Promise<boolean>;
}) {
  const [url, setUrl] = useState("");

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
        {shot.frames.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f.id} src={f.imageUrl} alt={`Frame ${f.order}`} className="w-24 h-16 object-cover rounded border border-ultra-violet" />
        ))}
      </div>
      {editable && (
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
  const [text, setText] = useState(values.join(", "));

  return (
    <div className="mb-2">
      <div className="text-xs opacity-70 mb-1">{label} (phân cách bởi dấu phẩy)</div>
      <input
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const v = text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange(v);
        }}
        className="w-full text-sm"
      />
    </div>
  );
}
