"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LiteUser = { id: number; name: string };

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function login(userId: number) {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đăng nhập thất bại");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-dark-green rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-saffron text-center mb-1">ZVIDEO</h1>
        <p className="text-center text-sm text-ultra-violet mb-6">Chọn tài khoản để đăng nhập</p>

        {loading && <p className="text-center text-sm opacity-70">Đang tải...</p>}
        {error && <p className="text-center text-sm text-red-400 mb-3">{error}</p>}

        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => login(u.id)}
              className="w-full text-left px-4 py-3 rounded-lg bg-dark-purple hover:bg-ultra-violet transition-colors text-saffron font-medium"
            >
              {u.name}
            </button>
          ))}
          {!loading && users.length === 0 && (
            <p className="text-center text-sm opacity-70">Chưa có user nào trong hệ thống.</p>
          )}
        </div>
      </div>
    </main>
  );
}
