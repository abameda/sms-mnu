"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  title: string;
  userName: string;
  role: string;
  onMenuToggle: () => void;
}

const roleBadgeClass: Record<string, string> = {
  admin: "badge badge-primary",
  student_affairs: "badge badge-info",
  student: "badge badge-success",
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  student_affairs: "Student Affairs",
  student: "Student",
};

export default function Header({ title, userName, role, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const canSearchStudents = role === "admin" || role === "student_affairs";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {canSearchStudents && (
            <form onSubmit={handleSearch} className="hidden md:block">
              <label className="relative block">
                <span className="sr-only">Search students</span>
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students"
                  className="w-56 lg:w-72 pl-9 pr-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </form>
          )}
          <button className="relative p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <span className={roleBadgeClass[role] ?? "badge badge-primary"}>{roleLabel[role] ?? role}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
