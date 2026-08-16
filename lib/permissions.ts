import { Role } from "./types";

export const PERMISSION_MODULES = [
  "nhanvat",
  "tapinfo",
  "canh",
  "shot",
  "hanhdong",
  "thoai",
  "amthanh",
  "anhsang",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type PermissionUser = { id: number; role: Role; permissions: string[] };

// Manager và Admin có toàn quyền trên nội dung sản xuất (Project/Tập/Cảnh/...).
// Khác biệt duy nhất giữa hai role này là quản lý user (xem isManager bên dưới).
export function hasFullAccess(user: { role: Role } | null | undefined): boolean {
  return user?.role === "MANAGER" || user?.role === "ADMIN";
}

// Chỉ Manager mới được thêm/sửa/xóa/ẩn user khác — Admin bị loại trừ quyền này.
export function isManager(user: { role: Role } | null | undefined): boolean {
  return user?.role === "MANAGER";
}

export function hasPermission(user: PermissionUser | null | undefined, module: PermissionModule): boolean {
  if (!user) return false;
  return hasFullAccess(user) || user.permissions.includes(module);
}

// Sửa/xóa/ẩn một đối tượng cụ thể: Manager/Admin luôn được; Staff chỉ được
// trên đối tượng do chính mình tạo ra (vẫn cần đúng quyền module).
export function canModify(
  user: PermissionUser | null | undefined,
  module: PermissionModule,
  createdById: number,
): boolean {
  if (!user) return false;
  if (!hasPermission(user, module)) return false;
  return hasFullAccess(user) || user.id === createdById;
}

export const SHOT_CONTENT_TYPE_TO_MODULE: Record<string, PermissionModule> = {
  HANHDONG: "hanhdong",
  THOAI: "thoai",
  AMTHANH: "amthanh",
  ANHSANG: "anhsang",
};
