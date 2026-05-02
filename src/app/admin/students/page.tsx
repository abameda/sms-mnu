"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import StudentForm from "@/components/StudentForm";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Student {
  id: number;
  name: string;
  student_id: string;
  email: string | null;
  phone: string | null;
  department_id: number;
  year: number;
  enrollment_year: number;
  status: string;
  department_name: string;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async (page = 1, searchQuery = "", searchType = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) {
        params.set("search", searchQuery);
        if (searchType) params.set("type", searchType);
      }
      const res = await fetch(`/api/students?${params}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        setPagination(json.pagination);
      }
    } catch {
      addToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Student added successfully", "success");
        setShowAddModal(false);
        fetchStudents(pagination.page);
      } else {
        addToast(json.error || "Failed to add student", "error");
      }
    } catch {
      addToast("Failed to add student", "error");
    }
  };

  const columns = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "department_name", label: "Department" },
    { key: "year", label: "Year" },
    { key: "status", label: "Status" },
  ];

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>

        {/* ── Page header ── */}
        <div className="page-header" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}>
            Academic records
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--foreground)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}>
              Students
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                borderRadius: "0.5rem",
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                padding: "0.5rem 1.125rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              Add Student
            </button>
          </div>
        </div>

        {/* ── Students surface ── */}
        <div
          className="glass-card section-card"
          style={{ "--delay": "120ms", overflow: "hidden", padding: 0 } as React.CSSProperties}
        >
          {loading ? (
            <div style={{ padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${75 + Math.random() * 20}%`, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p className="empty-state-title">No students yet</p>
              <p className="empty-state-body">Add the first student to get started tracking academic records.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary-cta"
                style={{
                  marginTop: "0.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.4375rem 1rem",
                  borderRadius: "0.5rem",
                  background: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add Student
              </button>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={students}
                onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
              />
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1.25rem",
                borderTop: "1px solid var(--border)",
              }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
                  {students.length} of {pagination.total} students
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button
                    onClick={() => fetchStudents(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", padding: "0 0.5rem" }}>
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchStudents(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <StudentForm onSubmit={handleAddStudent} isEditing={false} />
      </Modal>
    </>
  );
}
