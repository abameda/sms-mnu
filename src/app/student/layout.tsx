import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { ToastProvider } from "@/components/Toast";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role === "admin" || role === "student_affairs") {
    redirect("/admin/dashboard");
  }

  const userName = (session.user as { username?: string }).username || "Student";

  return (
    <ToastProvider>
      <DashboardShell role="student" userName={userName} title="Student Portal">
        {children}
      </DashboardShell>
    </ToastProvider>
  );
}