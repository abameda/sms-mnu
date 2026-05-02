import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "admin" || role === "student_affairs") {
    redirect("/admin/dashboard");
  }

  if (role === "student") {
    redirect("/student/dashboard");
  }

  redirect("/login");
}
