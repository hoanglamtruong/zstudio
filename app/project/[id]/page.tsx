import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import ProjectEditor from "@/components/ProjectEditor";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return (
    <>
      <Nav user={user} />
      <ProjectEditor projectId={Number(id)} user={user} />
    </>
  );
}
