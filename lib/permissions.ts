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

export type PermissionUser = { isLeader: boolean; permissions: string[] };

export function hasPermission(user: PermissionUser | null | undefined, module: PermissionModule): boolean {
  if (!user) return false;
  return user.isLeader || user.permissions.includes(module);
}

export const SHOT_CONTENT_TYPE_TO_MODULE: Record<string, PermissionModule> = {
  HANHDONG: "hanhdong",
  THOAI: "thoai",
  AMTHANH: "amthanh",
  ANHSANG: "anhsang",
};
