import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import UserManagement from "@/components/UserManagement";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER") redirect("/");

  return (
    <>
      <Nav user={user} />
      <UserManagement />
    </>
  );
}
