"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
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
      <form onSubmit={login} className="w-full max-w-sm bg-dark-green rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-saffron text-center mb-1">ZVIDEO</h1>
        <p className="text-center text-sm text-ultra-violet mb-6">Đăng nhập để tiếp tục</p>

        {error && <p className="text-center text-sm text-red-400 mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            autoComplete="username"
            className="w-full"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className="w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
        <p className="text-center text-xs mt-4">
          <Link href="/register" className="text-ultra-violet hover:text-saffron underline">
            Chưa có tài khoản? Đăng ký
          </Link>
        </p>
      </form>
    </main>
  );
}
