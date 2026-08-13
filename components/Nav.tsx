"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavUser = { id: number; name: string; isLeader: boolean };

export default function Nav({ user }: { user: NavUser }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-dark-green border-b border-ultra-violet px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-saffron">
        ZVIDEO
      </Link>
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
