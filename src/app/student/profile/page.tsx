import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface StudentProfile {
  name: string; student_id: string; email: string | null; phone: string | null;
  department_name: string; year: number; enrollment_year: number; status: string;
}

function statusBadgeClass(status: string): string {
  if (status === "active") return "badge-status-active";
  if (status === "graduated") return "badge-status-graduated";
  if (status === "suspended") return "badge-status-suspended";
  return "badge badge-primary";
}

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const studentId = (session.user as { student_id?: number | null }).student_id;
  let student: StudentProfile | null = null;
  if (studentId) {
    const db = getDb();
    student = db
      .prepare(`SELECT s.*, d.name as department_name FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = ?`)
      .get(studentId) as StudentProfile | null;
  }

  if (!student) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ position:"relative", zIndex:1 }}>
          <div className="glass-card">
            <div className="empty-state">
              <p className="empty-state-title">Profile Not Found</p>
              <p className="empty-state-body">Unable to load your profile. Please contact administration.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: "Student ID", value: student.student_id },
    { label: "Email", value: student.email || "N/A" },
    { label: "Phone", value: student.phone || "N/A" },
    { label: "Department", value: student.department_name },
    { label: "Year", value: String(student.year) },
    { label: "Enrollment Year", value: String(student.enrollment_year) },
  ];

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Student portal</p>
          <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>My Profile</h1>
        </div>

        <div className="glass-card section-card" style={{ "--delay":"120ms", overflow:"hidden", padding:0, maxWidth:"36rem" } as React.CSSProperties}>
          {/* Profile hero */}
          <div className="profile-hero">
            <div style={{ display:"flex", alignItems:"center", gap:"1.25rem" }}>
              <div style={{ width:"3.5rem", height:"3.5rem", borderRadius:"50%", background:"oklch(0.45 0.10 175)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(0.96 0.015 90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize:"1.25rem", fontWeight:800, color:"oklch(0.96 0.015 90)", letterSpacing:"-0.02em" }}>{student.name}</h2>
                <p style={{ fontSize:"0.8125rem", color:"oklch(0.70 0.08 175)", marginTop:"0.125rem" }}>{student.department_name}</p>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding:"1.5rem 1.75rem" }}>
            <dl>
              {fields.map(f => (
                <div key={f.label} className="info-row">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
              <div className="info-row">
                <dt>Status</dt>
                <dd><span className={statusBadgeClass(student.status)} style={{ textTransform:"capitalize" }}>{student.status}</span></dd>
              </div>
            </dl>
          </div>
        </div>

      </div>
    </>
  );
}
