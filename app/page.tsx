import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import ProjectList from "@/components/ProjectList";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Nav user={user} />
      <ProjectList />
    </>
  );
}
