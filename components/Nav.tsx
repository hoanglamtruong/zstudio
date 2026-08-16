"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PwaInstall from "./PwaInstall";
import { Role } from "@/lib/types";

type NavUser = { id: number; name: string; role: Role };

const ROLE_LABELS: Record<Role, string> = {
  MANAGER: "Manager",
  ADMIN: "Admin",
  STAFF: "Staff",
};
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
    <header className="bg-dark-green border-b border-ultra-violet px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Link href="/" className="text-lg sm:text-xl font-bold text-saffron shrink-0">
          ZVIDEO
        </Link>
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={toggleMenu}
            className="text-sm px-3 py-1.5 rounded-md bg-ultra-violet text-dark-purple font-semibold"
          >
            Dự án ▾
          </button>

          {open && (
            <>
              {/* Mobile: bottom sheet */}
              <div
                className="sm:hidden fixed inset-0 bg-black/60 z-50 flex items-end overflow-hidden"
                onClick={() => setOpen(false)}
              >
                <div
                  className="bg-dark-purple border border-ultra-violet w-full min-w-0 max-w-full box-border rounded-t-2xl flex flex-col max-h-[80vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-ultra-violet flex items-center justify-between shrink-0">
                    <div className="text-sm font-semibold text-saffron">Dự án</div>
                    <button onClick={() => setOpen(false)} aria-label="Đóng" className="text-ultra-violet text-xl leading-none px-2">
                      ✕
                    </button>
                  </div>
                  <div className="overflow-y-auto">
                    <ProjectMenuList projects={projects} onNavigate={() => setOpen(false)} router={router} />
                  </div>
                </div>
              </div>

              {/* Desktop/tablet: dropdown */}
              <div className="hidden sm:block absolute left-0 top-full mt-1 w-64 rounded-md bg-dark-purple border border-ultra-violet shadow-lg z-50 max-h-96 overflow-y-auto">
                <ProjectMenuList projects={projects} onNavigate={() => setOpen(false)} router={router} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-sm flex-wrap justify-end min-w-0">
        <PwaInstall />
        <span className="text-saffron truncate max-w-[40vw] sm:max-w-none">
          {user.name}
          {user.role !== "STAFF" && (
            <span className="ml-2 px-2 py-0.5 rounded bg-ultra-violet text-xs align-middle">
              {ROLE_LABELS[user.role]}
            </span>
          )}
        </span>
        {user.role === "MANAGER" && (
          <Link href="/users" className="text-ultra-violet hover:text-saffron underline shrink-0">
            Quản lý user
          </Link>
        )}
        <button onClick={logout} className="text-ultra-violet hover:text-saffron underline shrink-0">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

function ProjectMenuList({
  projects,
  onNavigate,
  router,
}: {
  projects: NavProject[] | null;
  onNavigate: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      {projects === null && <p className="px-3 py-2 text-sm opacity-70">Đang tải...</p>}
      {projects?.length === 0 && <p className="px-3 py-2 text-sm opacity-70">Chưa có dự án nào.</p>}
      {projects?.map((p) => (
        <button
          key={p.id}
          onClick={() => {
            onNavigate();
            router.push(`/project/${p.id}`);
          }}
          className="block w-full text-left px-4 py-3 sm:px-3 sm:py-2 text-sm text-saffron hover:bg-ultra-violet active:bg-ultra-violet"
        >
          {p.title}
        </button>
      ))}
      <Link
        href="/"
        onClick={onNavigate}
        className="block px-4 py-3 sm:px-3 sm:py-2 text-sm border-t border-ultra-violet text-ultra-violet hover:text-saffron"
      >
        Xem tất cả / Tạo dự án mới
      </Link>
    </>
  );
}
