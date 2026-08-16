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
// Assistant KHÔNG có quyền này — vai trò của Assistant chỉ xoay quanh quản lý
// tài khoản user, không đụng vào nội dung project.
export function hasFullAccess(user: { role: Role } | null | undefined): boolean {
  return user?.role === "MANAGER" || user?.role === "ADMIN";
}

// Quản lý tài khoản user (duyệt đăng ký, đổi tên, reset mật khẩu, ẩn/xóa,
// đổi role của user khác): Manager và Assistant.
export function canManageUsers(user: { role: Role } | null | undefined): boolean {
  return user?.role === "MANAGER" || user?.role === "ASSISTANT";
}

// Gán quyền module (nhanvat/tapinfo/canh/shot/...) cho từng Staff — tức
// quyết định Staff nào được sửa phần nào trong project: Manager và Admin
// (người hiểu cấu trúc project), không phải Assistant.
export function canAssignStaffPermissions(user: { role: Role } | null | undefined): boolean {
  return user?.role === "MANAGER" || user?.role === "ADMIN";
}

// Chỉ có duy nhất 1 Manager trong hệ thống — không role nào được gán role
// này qua ứng dụng, và tài khoản Manager không thể bị sửa qua API quản lý
// user (đổi tên/mật khẩu/role/ẩn/xóa).
export function isProtectedManager(user: { role: Role } | null | undefined): boolean {
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
