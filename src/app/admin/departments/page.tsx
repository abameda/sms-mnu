"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Department {
  id: number;
  name: string;
  code: string;
}

export default function AdminDepartmentsPage() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const json = await res.json();
      if (json.success) setDepartments(json.data);
    } catch {
      addToast("Failed to fetch departments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setFormName("");
    setFormCode("");
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        const res = await fetch(`/api/departments/${editingDept.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, code: formCode }),
        });
        const json = await res.json();
        if (json.success) {
          addToast("Department updated", "success");
          setShowModal(false);
          fetchDepartments();
        } else {
          addToast(json.error || "Failed to update department", "error");
        }
      } else {
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, code: formCode }),
        });
        const json = await res.json();
        if (json.success) {
          addToast("Department created", "success");
          setShowModal(false);
          fetchDepartments();
        } else {
          addToast(json.error || "Failed to create department", "error");
        }
      }
    } catch {
      addToast("Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
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
            Academic structure
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--foreground)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}>
              Departments
            </h1>
            <button
              onClick={openAddModal}
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
              Add Department
            </button>
          </div>
        </div>

        {/* ── Departments surface ── */}
        <div
          className="glass-card section-card"
          style={{ "--delay": "120ms", overflow: "hidden", padding: 0 } as React.CSSProperties}
        >
          {loading ? (
            <div style={{ padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${60 + i * 10}%`, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/>
              </svg>
              <p className="empty-state-title">No departments yet</p>
              <p className="empty-state-body">Create the first academic department to begin organizing your institution.</p>
              <button
                onClick={openAddModal}
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
                Add Department
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={departments}
              onRowClick={(row) => openEditModal(row as unknown as Department)}
            />
          )}
        </div>

      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDept ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label" htmlFor="dept-name">Name</label>
            <input
              id="dept-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="form-input"
              placeholder="e.g. Computer and Artificial Intelligence"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="dept-code">Code</label>
            <input
              id="dept-code"
              type="text"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
              className="form-input"
              placeholder="e.g. CS"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-ghost-cta"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                background: "var(--card)",
                color: "var(--foreground)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-cta"
              style={{
                padding: "0.5rem 1.125rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                borderRadius: "0.5rem",
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                border: "none",
                cursor: "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Saving..." : editingDept ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
