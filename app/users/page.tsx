import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAssignStaffPermissions, canManageUsers } from "@/lib/permissions";
import Nav from "@/components/Nav";
import UserManagement from "@/components/UserManagement";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManageUsers(user) && !canAssignStaffPermissions(user)) redirect("/");

  return (
    <>
      <Nav user={user} />
      <UserManagement
        canManageAccounts={canManageUsers(user)}
        canAssignPermissions={canAssignStaffPermissions(user)}
      />
    </>
  );
}
