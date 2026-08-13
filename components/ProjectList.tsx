"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = { id: number; title: string; createdAt: string };

export default function ProjectList() {
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
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => router.push(`/project/${p.id}`)}
            className="text-left px-4 py-3 rounded-lg bg-dark-green hover:bg-ultra-violet transition-colors"
          >
            <div className="font-medium text-saffron">{p.title}</div>
            <div className="text-xs opacity-60">{new Date(p.createdAt).toLocaleString("vi-VN")}</div>
          </button>
        ))}
        {!loading && projects.length === 0 && (
          <p className="opacity-70 text-sm">Chưa có dự án nào. Tạo dự án đầu tiên ở trên.</p>
        )}
      </div>
    </main>
  );
}
