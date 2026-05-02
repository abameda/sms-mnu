"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentForm from "@/components/StudentForm";
import { useToast } from "@/components/Toast";

export default function NewStudentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const j = await fetch("/api/students", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }).then(r => r.json());
      if (j.success) { addToast("Student created", "success"); router.push("/admin/students"); }
      else addToast(j.error || "Failed to create student", "error");
    } catch { addToast("Failed to create student", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <Link href="/admin/students" className="back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Students
          </Link>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Academic records</p>
          <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Add New Student</h1>
          <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>Enter the student details below</p>
        </div>

        <div className="glass-card section-card" style={{ "--delay":"120ms", padding:"1.75rem", maxWidth:"40rem" } as React.CSSProperties}>
          <StudentForm onSubmit={handleSubmit} isEditing={false} />
          {submitting && (
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"1rem", color:"var(--muted-foreground)" }}>
              <div className="spinner" />
              <span style={{ fontSize:"0.875rem" }}>Creating student...</span>
            </div>
          )}
        </div>

      </div>
    </>
  );
}