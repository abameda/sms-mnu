"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentForm from "@/components/StudentForm";
import { useToast } from "@/components/Toast";
import TranscriptView from "@/components/TranscriptView";

interface StudentData {
  name: string; student_id: string; email?: string; phone?: string;
  department_id: number; department_name: string; year: number;
  enrollment_year: number; status: string; gpa?: number;
  grades: Record<string, unknown>[]; [key: string]: unknown;
}

interface StudentDetailContentProps { student: StudentData; studentDbId: string; }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function letterBadgeClass(letter: string): string {
  if (["A+","A","A-"].includes(letter)) return "badge badge-success";
  if (["B+","B","B-"].includes(letter)) return "badge badge-primary";
  if (["C+","C","C-"].includes(letter)) return "badge badge-warning";
  return "badge badge-danger";
}

export default function StudentDetailContent({ student, studentDbId }: StudentDetailContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptData, setTranscriptData] = useState<import("@/lib/types").TranscriptData | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const grades: Record<string, unknown>[] = student.grades || [];
  const semesters = new Map<string, Record<string, unknown>[]>();
  for (const g of grades) {
    const key = `${g.semester} ${g.academic_year}`;
    if (!semesters.has(key)) semesters.set(key, []);
    semesters.get(key)!.push(g);
  }

  const openTranscript = async () => {
    setTranscriptOpen(true);
    if (!transcriptData) {
      setTranscriptLoading(true);
      try {
        const j = await fetch(`/api/transcript/${studentDbId}`).then(r => r.json());
        if (j.success) setTranscriptData(j.data);
      } catch { /* ignore */ }
      finally { setTranscriptLoading(false); }
    }
  };

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    try {
      const j = await fetch(`/api/students/${studentDbId}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }).then(r => r.json());
      if (j.success) { addToast("Student updated", "success"); setIsEditing(false); router.refresh(); }
      else addToast(j.error || "Failed to update", "error");
    } catch { addToast("Failed to update student", "error"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${studentDbId}`, { method:"DELETE" });
      if (res.ok) router.push("/admin/students");
      else addToast("Failed to delete student", "error");
    } catch { addToast("Failed to delete student", "error"); }
  };

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <Link href="/admin/students" className="back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Students
          </Link>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>{student.name}</h1>
              <p style={{ fontSize:"0.875rem", color:"var(--muted-foreground)", marginTop:"0.25rem" }}>ID: {student.student_id}</p>
            </div>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              {!isEditing && (
                <button onClick={openTranscript} className="btn-ghost-cta" style={{ padding:"0.5rem 1rem", fontSize:"0.8125rem", fontWeight:600, border:"1px solid var(--border)", borderRadius:"0.5rem", background:"var(--card)", color:"var(--foreground)", cursor:"pointer" }}>
                  Transcript
                </button>
              )}
              {isEditing ? (
                <button onClick={() => setIsEditing(false)} className="btn-ghost-cta" style={{ padding:"0.5rem 1rem", fontSize:"0.8125rem", fontWeight:600, border:"1px solid var(--border)", borderRadius:"0.5rem", background:"var(--card)", color:"var(--foreground)", cursor:"pointer" }}>Cancel</button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-primary-cta" style={{ padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:700, borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", border:"none", cursor:"pointer" }}>Edit</button>
              )}
              <button onClick={handleDelete} style={{ padding:"0.5rem 1rem", fontSize:"0.8125rem", fontWeight:700, borderRadius:"0.5rem", background:"var(--color-danger-light)", color:"var(--color-danger)", border:"1px solid oklch(0.66 0.19 15 / 0.3)", cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="glass-card section-card" style={{ "--delay":"80ms", padding:"1.75rem" } as React.CSSProperties}>
            <p className="section-heading">Edit Student</p>
            <StudentForm
              initialData={{ name: student.name, student_id: student.student_id, email: student.email || "", phone: student.phone || "", department_id: student.department_id, year: student.year, enrollment_year: student.enrollment_year, status: student.status as "active" | "graduated" | "suspended" }}
              onSubmit={handleEditSubmit} isEditing={true}
            />
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%,18rem), 1fr))", gap:"1rem", alignItems:"start" }}>

            {/* Personal info */}
            <div className="glass-card section-card" style={{ "--delay":"120ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
              <p className="section-heading">Personal Information</p>
              <dl>
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Student ID" value={student.student_id} />
                <InfoRow label="Email" value={student.email || "N/A"} />
                <InfoRow label="Phone" value={student.phone || "N/A"} />
                <InfoRow label="Department" value={student.department_name} />
                <InfoRow label="Year" value={String(student.year)} />
                <InfoRow label="Enrollment Year" value={String(student.enrollment_year)} />
                <InfoRow label="Status" value={student.status} />
                {student.gpa !== undefined && <InfoRow label="GPA" value={String(student.gpa)} />}
              </dl>
            </div>

            {/* Academic record */}
            <div className="glass-card section-card" style={{ "--delay":"200ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
              <p className="section-heading">Academic Record</p>
              {semesters.size === 0 ? (
                <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>No grades recorded yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                  {Array.from(semesters.entries()).map(([label, semGrades]) => (
                    <div key={label}>
                      <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--muted-foreground)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"0.5rem", paddingBottom:"0.375rem", borderBottom:"1px solid var(--border)" }}>{label}</p>
                      <table className="data-table">
                        <thead><tr>
                          <th>Subject</th><th>Code</th>
                          <th style={{ textAlign:"center" }}>Cr.</th>
                          <th style={{ textAlign:"center" }}>Grade</th>
                          <th style={{ textAlign:"center" }}>Letter</th>
                        </tr></thead>
                        <tbody>
                          {semGrades.map(g => (
                            <tr key={String(g.id)}>
                              <td>{String(g.subject_name)}</td>
                              <td className="muted">{String(g.subject_code)}</td>
                              <td style={{ textAlign:"center" }}>{String(g.credits)}</td>
                              <td style={{ textAlign:"center", fontWeight:700 }}>{String(g.grade)}</td>
                              <td style={{ textAlign:"center" }}><span className={letterBadgeClass(String(g.letter_grade))}>{String(g.letter_grade)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Transcript overlay */}
      {transcriptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", background:"oklch(0.10 0.005 220 / 0.75)", backdropFilter:"blur(4px)" }} onClick={() => setTranscriptOpen(false)}>
          <div style={{ background:"var(--card)", borderRadius:"1rem", boxShadow:"0 24px 80px oklch(0.05 0.005 220 / 0.8)", width:"100%", maxWidth:"56rem", maxHeight:"90vh", overflowY:"auto", border:"1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.125rem 1.5rem", borderBottom:"1px solid var(--border)", position:"sticky", top:0, background:"var(--card)", zIndex:10 }}>
              <p style={{ fontSize:"1rem", fontWeight:700, color:"var(--foreground)" }}>Transcript — {student.name}</p>
              <button onClick={() => setTranscriptOpen(false)} style={{ padding:"0.375rem", borderRadius:"0.5rem", background:"none", border:"none", color:"var(--muted-foreground)", cursor:"pointer", lineHeight:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              {transcriptLoading ? (
                <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--muted-foreground)" }}>
                  <div className="spinner" style={{ margin:"0 auto 0.75rem" }} />
                  <p style={{ fontSize:"0.875rem" }}>Loading transcript...</p>
                </div>
              ) : transcriptData ? (
                <TranscriptView transcriptData={transcriptData} />
              ) : (
                <p style={{ textAlign:"center", color:"var(--muted-foreground)", padding:"2rem 0" }}>Failed to load transcript.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
