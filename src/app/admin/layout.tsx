import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { ToastProvider } from "@/components/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role === "student") {
    redirect("/student/dashboard");
  }

  const userName = (session.user as { username?: string }).username || "Admin";

  return (
    <ToastProvider>
      <DashboardShell role={(role as "admin" | "student_affairs") ?? "admin"} userName={userName} title="Admin Panel">
        {children}
      </DashboardShell>
    </ToastProvider>
  );
}