"use client";

import { useEffect, useState } from "react";
import { PERMISSION_MODULES, PermissionModule } from "@/lib/permissions";

type ApiUser = {
  id: number;
  username: string;
  name: string;
  isLeader: boolean;
  permissions: string[];
  active: boolean;
};

const MODULE_LABELS: Record<PermissionModule, string> = {
  nhanvat: "Nhân vật",
  tapinfo: "Thông tin Tập",
  canh: "Cảnh",
  shot: "Shot",
  hanhdong: "Hành động",
  thoai: "Thoại",
  amthanh: "Âm thanh",
  anhsang: "Ánh sáng",
};

export default function UserManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function createUser() {
    if (!name.trim() || !username.trim() || password.length < 6) {
      setError("Điền đủ tên, tên đăng nhập và mật khẩu (từ 6 ký tự)");
      return;
    }
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, permissions: [] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Tạo user thất bại");
      return;
    }
    setName("");
    setUsername("");
    setPassword("");
    load();
  }

  async function togglePermission(u: ApiUser, module: PermissionModule) {
    const has = u.permissions.includes(module);
    const permissions = has ? u.permissions.filter((p) => p !== module) : [...u.permissions, module];
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, permissions } : x)));
    await fetch(`/api/users/${u.id}/permissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    });
  }

  async function renameUser(u: ApiUser, newName: string) {
    const n = newName.trim();
    if (!n || n === u.name) return;
    setError("");
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Sửa tên thất bại");
    }
    load();
  }

  async function resetPassword(u: ApiUser) {
    const next = prompt(`Mật khẩu mới cho "${u.name}" (từ 6 ký tự):`);
    if (!next) return;
    setError("");
    const res = await fetch(`/api/users/${u.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đổi mật khẩu thất bại");
      return;
    }
    alert("Đã đổi mật khẩu.");
  }

  async function toggleActive(u: ApiUser) {
    setError("");
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Thao tác thất bại");
      return;
    }
    load();
  }

  async function deleteUser(u: ApiUser) {
    if (!confirm(`Xóa hẳn user "${u.name}"? Hành động này không thể hoàn tác.`)) return;
    setError("");
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Xóa thất bại");
      return;
    }
    load();
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-saffron mb-6">Quản lý User &amp; Phân quyền</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hiển thị..." />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập..." />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu (≥6 ký tự)..."
        />
      </div>
      <div className="mb-6">
        <button onClick={createUser} className="px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold">
          + Thêm user
        </button>
      </div>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {loading && <p className="opacity-70 text-sm">Đang tải...</p>}

      <div className="flex flex-col gap-4">
        {users.map((u) => (
          <div key={u.id} className={`bg-dark-green rounded-lg p-4 ${!u.active ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-2 mb-1">
              <input
                defaultValue={u.name}
                key={u.name}
                onBlur={(e) => renameUser(u, e.target.value)}
                className="font-medium flex-1"
              />
              {u.isLeader && <span className="px-2 py-0.5 rounded bg-ultra-violet text-xs shrink-0">Leader</span>}
              {!u.active && <span className="px-2 py-0.5 rounded bg-dark-purple text-xs shrink-0">Đã ẩn</span>}
            </div>
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="opacity-60">Đăng nhập: {u.username}</span>
              <button onClick={() => resetPassword(u)} className="text-ultra-violet hover:text-saffron underline">
                Đổi mật khẩu
              </button>
              <button onClick={() => toggleActive(u)} className="text-ultra-violet hover:text-saffron underline">
                {u.active ? "Ẩn" : "Hiện lại"}
              </button>
              <button onClick={() => deleteUser(u)} className="text-red-400 hover:text-red-300 underline">
                Xóa
              </button>
            </div>
            {u.isLeader ? (
              <p className="text-xs opacity-60">Leader có toàn quyền, không cần gán riêng.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {PERMISSION_MODULES.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-dark-purple text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={u.permissions.includes(m)}
                      onChange={() => togglePermission(u, m)}
                    />
                    {MODULE_LABELS[m]}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
