"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NavUser = { id: number; name: string; isLeader: boolean };
type NavProject = { id: number; title: string };

export default function Nav({ user }: { user: NavUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<NavProject[] | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggleMenu() {
    setOpen((v) => !v);
    if (!projects) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => setProjects(data.projects ?? []));
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-dark-green border-b border-ultra-violet px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-saffron">
          ZVIDEO
        </Link>
        <div ref={menuRef} className="relative">
          <button
            onClick={toggleMenu}
            className="text-sm px-3 py-1.5 rounded-md bg-ultra-violet text-dark-purple font-semibold"
          >
            Dự án ▾
          </button>
          {open && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-md bg-dark-purple border border-ultra-violet shadow-lg z-50 max-h-96 overflow-y-auto">
              {projects === null && <p className="px-3 py-2 text-sm opacity-70">Đang tải...</p>}
              {projects?.length === 0 && <p className="px-3 py-2 text-sm opacity-70">Chưa có dự án nào.</p>}
              {projects?.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/project/${p.id}`);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-saffron hover:bg-ultra-violet"
                >
                  {p.title}
                </button>
              ))}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm border-t border-ultra-violet text-ultra-violet hover:text-saffron"
              >
                Xem tất cả / Tạo dự án mới
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-saffron">
          {user.name}
          {user.isLeader && (
            <span className="ml-2 px-2 py-0.5 rounded bg-ultra-violet text-xs align-middle">Leader</span>
          )}
        </span>
        {user.isLeader && (
          <Link href="/users" className="text-ultra-violet hover:text-saffron underline">
            Quản lý user
          </Link>
        )}
        <button onClick={logout} className="text-ultra-violet hover:text-saffron underline">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
