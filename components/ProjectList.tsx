"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasFullAccess } from "@/lib/permissions";
import { Role } from "@/lib/types";

type Project = { id: number; title: string; createdAt: string; createdById: number };
type ListUser = { id: number; role: Role };

export default function ProjectList({ user }: { user: ListUser }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createProject() {
    const t = title.trim();
    if (!t) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t }),
    });
    if (res.ok) {
      setTitle("");
      load();
    }
  }

  async function deleteProject(p: Project) {
    if (!confirm(`Xóa dự án "${p.title}"? Toàn bộ Tập/Cảnh/Shot bên trong sẽ bị xóa vĩnh viễn.`)) return;
    const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Xóa dự án thất bại");
    }
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-saffron mb-6">Dự án của bạn</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên dự án mới..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && createProject()}
        />
        <button
          onClick={createProject}
          className="px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold"
        >
          + Dự án mới
        </button>
      </div>

      {loading && <p className="opacity-70 text-sm">Đang tải...</p>}

      <div className="flex flex-col gap-2">
        {projects.map((p) => {
          const canDelete = hasFullAccess(user) || user.id === p.createdById;
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-lg bg-dark-green hover:bg-ultra-violet transition-colors"
            >
              <button
                onClick={() => router.push(`/project/${p.id}`)}
                className="flex-1 text-left px-4 py-3"
              >
                <div className="font-medium text-saffron">{p.title}</div>
                <div className="text-xs opacity-60">{new Date(p.createdAt).toLocaleString("vi-VN")}</div>
              </button>
              {canDelete && (
                <button
                  onClick={() => deleteProject(p)}
                  title="Xóa dự án"
                  className="px-3 py-3 text-sm text-red-400 hover:text-red-300"
                >
                  Xóa
                </button>
              )}
            </div>
          );
        })}
        {!loading && projects.length === 0 && (
          <p className="opacity-70 text-sm">Chưa có dự án nào. Tạo dự án đầu tiên ở trên.</p>
        )}
      </div>
    </main>
  );
}
