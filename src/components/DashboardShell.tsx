"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Role = "admin" | "student_affairs" | "student";

interface DashboardShellProps {
  role: Role;
  userName: string;
  title: string;
  children: React.ReactNode;
}

export default function DashboardShell({ role, userName, title, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const basePath = role === "student" ? "/student" : "/admin";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar role={role} userName={userName} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} basePath={basePath} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          userName={userName}
          role={role}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}