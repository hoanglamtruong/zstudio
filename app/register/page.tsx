"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !username.trim() || password.length < 6) {
      setError("Điền đủ tên, tên đăng nhập và mật khẩu (từ 6 ký tự)");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đăng ký thất bại");
      return;
    }
    setDone(true);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-dark-green rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-saffron text-center mb-1">ZVIDEO</h1>
        <p className="text-center text-sm text-ultra-violet mb-6">Đăng ký tài khoản mới</p>

        {done ? (
          <div className="text-center">
            <p className="text-sm text-saffron mb-4">
              Đăng ký thành công! Tài khoản của bạn đang chờ Manager duyệt trước khi đăng nhập được.
            </p>
            <Link href="/login" className="text-sm text-ultra-violet hover:text-saffron underline">
              Về trang đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={register}>
            {error && <p className="text-center text-sm text-red-400 mb-3">{error}</p>}
            <div className="flex flex-col gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên hiển thị"
                autoComplete="name"
                className="w-full"
              />
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
                placeholder="Mật khẩu (≥6 ký tự)"
                autoComplete="new-password"
                className="w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold disabled:opacity-60"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </div>
            <p className="text-center text-xs mt-4">
              <Link href="/login" className="text-ultra-violet hover:text-saffron underline">
                Đã có tài khoản? Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
