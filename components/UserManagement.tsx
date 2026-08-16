"use client";

import { useEffect, useState } from "react";
import { PERMISSION_MODULES, PermissionModule } from "@/lib/permissions";
import { Role } from "@/lib/types";

type ApiUser = {
  id: number;
  username: string;
  name: string;
  role: Role;
  permissions: string[];
  active: boolean;
  approved: boolean;
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

const ROLE_LABELS: Record<Role, string> = {
  MANAGER: "Manager",
  ASSISTANT: "Assistant",
  ADMIN: "Admin",
  STAFF: "Staff",
};

// Manager không gán được qua UI — chỉ có đúng 1 Manager trong hệ thống.
const ASSIGNABLE_ROLES: Role[] = ["ASSISTANT", "ADMIN", "STAFF"];

function PendingUserRow({
  user: u,
  onApprove,
  onReject,
}: {
  user: ApiUser;
  onApprove: (u: ApiUser, role: Role) => void;
  onReject: (u: ApiUser) => void;
}) {
  const [role, setRole] = useState<Role>("STAFF");

  return (
    <div className="bg-dark-green rounded-lg p-4 border border-ultra-violet">
      <div className="mb-2">
        <div className="font-medium text-saffron">{u.name}</div>
        <div className="text-xs opacity-60">Đăng nhập: {u.username}</div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs opacity-70">Duyệt với vai trò:</span>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="text-xs">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
          <option value="ASSISTANT">Assistant</option>
        </select>
        <button
          onClick={() => onApprove(u, role)}
          className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold text-xs"
        >
          Duyệt
        </button>
        <button onClick={() => onReject(u)} className="text-red-400 hover:text-red-300 underline text-xs">
          Từ chối
        </button>
      </div>
    </div>
  );
}

export default function UserManagement({
  canManageAccounts,
  canAssignPermissions,
}: {
  canManageAccounts: boolean;
  canAssignPermissions: boolean;
}) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("STAFF");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function patchUser(u: ApiUser, body: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Thao tác thất bại");
    }
    load();
  }

  async function createUser() {
    if (!name.trim() || !username.trim() || password.length < 6) {
      setError("Điền đủ tên, tên đăng nhập và mật khẩu (từ 6 ký tự)");
      return;
    }
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, role: newRole, permissions: [] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Tạo user thất bại");
      return;
    }
    setName("");
    setUsername("");
    setPassword("");
    setNewRole("STAFF");
    load();
  }

  async function approveUser(u: ApiUser, role: Role) {
    await patchUser(u, { approved: true, role });
  }

  async function rejectUser(u: ApiUser) {
    if (!confirm(`Từ chối đăng ký của "${u.name}"? Tài khoản sẽ bị xóa.`)) return;
    setError("");
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Thao tác thất bại");
      return;
    }
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
    await patchUser(u, { name: n });
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
    await patchUser(u, { active: !u.active });
  }

  async function changeRole(u: ApiUser, role: Role) {
    await patchUser(u, { role });
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

  const nonManager = users.filter((u) => u.role !== "MANAGER");
  const pending = nonManager.filter((u) => !u.approved);
  const approved = nonManager.filter((u) => u.approved);
  const staffOnly = approved.filter((u) => u.role === "STAFF");

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-saffron mb-6">Quản lý User &amp; Phân quyền</h1>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading && <p className="opacity-70 text-sm">Đang tải...</p>}

      {canManageAccounts && (
        <>
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-saffron mb-2">Chờ duyệt ({pending.length})</h2>
              <div className="flex flex-col gap-3">
                {pending.map((u) => (
                  <PendingUserRow key={u.id} user={u} onApprove={approveUser} onReject={rejectUser} />
                ))}
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-saffron mb-2">Tạo user mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên hiển thị..." />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập..." />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu (≥6 ký tự)..."
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <button onClick={createUser} className="px-4 py-2 rounded-md bg-saffron text-dark-purple font-semibold">
              + Thêm user
            </button>
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold text-saffron mb-2">Danh sách user</h2>
      <div className="flex flex-col gap-4">
        {(canManageAccounts ? approved : staffOnly).map((u) => (
          <div key={u.id} className={`bg-dark-green rounded-lg p-4 ${!u.active ? "opacity-50" : ""}`}>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              {canManageAccounts ? (
                <input
                  defaultValue={u.name}
                  key={u.name}
                  onBlur={(e) => renameUser(u, e.target.value)}
                  className="font-medium flex-1 min-w-0"
                />
              ) : (
                <span className="font-medium flex-1 min-w-0">{u.name}</span>
              )}
              {canManageAccounts ? (
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u, e.target.value as Role)}
                  className="text-xs shrink-0"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="px-2 py-0.5 rounded bg-ultra-violet text-xs shrink-0">{ROLE_LABELS[u.role]}</span>
              )}
              {!u.active && <span className="px-2 py-0.5 rounded bg-dark-purple text-xs shrink-0">Đã ẩn</span>}
            </div>

            {canManageAccounts && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mb-3 text-xs">
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
            )}

            {canAssignPermissions ? (
              u.role === "STAFF" ? (
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
              ) : (
                <p className="text-xs opacity-60">{ROLE_LABELS[u.role]} có toàn quyền nội dung, không cần gán riêng.</p>
              )
            ) : null}
          </div>
        ))}
        {!loading && (canManageAccounts ? approved : staffOnly).length === 0 && (
          <p className="opacity-70 text-sm">Chưa có user nào.</p>
        )}
      </div>
    </main>
  );
}
