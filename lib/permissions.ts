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

export type PermissionUser = { id: number; isLeader: boolean; permissions: string[] };

export function hasPermission(user: PermissionUser | null | undefined, module: PermissionModule): boolean {
  if (!user) return false;
  return user.isLeader || user.permissions.includes(module);
}

// Sửa/xóa/ẩn một đối tượng cụ thể: Leader luôn được; Staff chỉ được trên
// đối tượng do chính mình tạo ra (vẫn cần đúng quyền module).
export function canModify(
  user: PermissionUser | null | undefined,
  module: PermissionModule,
  createdById: number,
): boolean {
  if (!user) return false;
  if (!hasPermission(user, module)) return false;
  return user.isLeader || user.id === createdById;
}

export const SHOT_CONTENT_TYPE_TO_MODULE: Record<string, PermissionModule> = {
  HANHDONG: "hanhdong",
  THOAI: "thoai",
  AMTHANH: "amthanh",
  ANHSANG: "anhsang",
};
