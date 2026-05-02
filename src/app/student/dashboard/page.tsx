import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { letterGradeToPoints } from "@/lib/gpa";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const studentId = (session.user as { student_id?: number | null }).student_id;
  const userName = (session.user as { username?: string }).username || "Student";

  const db = getDb();
  let student = null as (Record<string, unknown> & { name: string; year: number; department_name: string }) | null;
  let grades: Record<string, unknown>[] = [];
  let gpa = 0;

  if (studentId) {
    student = db
      .prepare(`SELECT s.*, d.name as department_name FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = ?`)
      .get(studentId) as (Record<string, unknown> & { name: string; year: number; department_name: string }) | null;

    grades = db
      .prepare(`SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits FROM grades g LEFT JOIN subjects sub ON g.subject_id = sub.id WHERE g.student_id = ? ORDER BY g.academic_year DESC, g.id DESC`)
      .all(studentId) as Record<string, unknown>[];

    const totalPoints = grades.reduce((sum, g) => sum + letterGradeToPoints(String(g.letter_grade)) * Number(g.credits || 0), 0);
    const totalGradeCredits = grades.reduce((sum, g) => sum + Number(g.credits || 0), 0);
    gpa = totalGradeCredits ? Math.round((totalPoints / totalGradeCredits) * 100) / 100 : 0;
  }

  const recentGrades = grades.slice(0, 5);
  const totalCredits = grades.reduce((sum: number, g) => sum + (Number(g.credits) || 0), 0);
  const currentYear = student ? `Year ${student.year}` : "N/A";

  function letterBadgeClass(letter: string): string {
    if (["A+","A","A-"].includes(letter)) return "badge badge-success";
    if (["B+","B","B-"].includes(letter)) return "badge badge-primary";
    if (["C+","C","C-"].includes(letter)) return "badge badge-warning";
    return "badge badge-danger";
  }

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />

      {/* Responsive stat strip styles */}
      <style>{`
        .student-stat-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.875rem;
        }
        @media (max-width: 480px) {
          .student-stat-strip {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
        @media (min-width: 481px) and (max-width: 640px) {
          .student-stat-strip {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.625rem;
          }
          .student-stat-strip .bento-cell {
            padding: 1.25rem 1rem 1rem !important;
          }
          .student-stat-strip .bento-cell p:nth-child(2) {
            font-size: 2.25rem !important;
          }
        }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        {/* ── Identity header ── */}
        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>
            {student?.department_name || "Student portal"}
          </p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>
                {student?.name || userName}
              </h1>
              <p style={{ fontSize:"0.875rem", color:"var(--muted-foreground)", marginTop:"0.25rem" }}>{currentYear}</p>
            </div>
            <div style={{ display:"flex", gap:"0.625rem", flexWrap:"wrap" }}>
              <Link href="/student/grades" className="btn-primary-cta" style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:700, textDecoration:"none" }}>
                View Grades
              </Link>
              <Link href="/student/transcript" className="btn-ghost-cta" style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", borderRadius:"0.5rem", border:"1px solid var(--border)", background:"var(--card)", color:"var(--foreground)", padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:600, textDecoration:"none" }}>
                Transcript
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat strip bento ── */}
        <div className="student-stat-strip">
          {/* GPA — committed teal */}
          <div className="bento-cell" style={{ "--delay":"120ms", gridColumn:"span 1", borderRadius:"1rem", background:"oklch(0.26 0.09 175)", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem", position:"relative", overflow:"hidden" } as React.CSSProperties}>
            <div style={{ position:"absolute", right:"-2rem", top:"-2rem", width:"9rem", height:"9rem", borderRadius:"50%", border:"2px solid oklch(0.55 0.10 175)", opacity:0.3, pointerEvents:"none" }} aria-hidden="true" />
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"oklch(0.78 0.08 175)" }}>GPA</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"oklch(0.96 0.015 90)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>
              {gpa > 0 ? gpa.toFixed(2) : "—"}
            </p>
            <p style={{ fontSize:"0.75rem", color:"oklch(0.65 0.06 175)" }}>Out of 4.00</p>
          </div>
          {/* Credits */}
          <div className="glass-card bento-cell" style={{ "--delay":"200ms", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem" } as React.CSSProperties}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Credits</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"var(--foreground)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{totalCredits}</p>
            <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)" }}>Graded</p>
          </div>
          {/* Subjects */}
          <div className="glass-card bento-cell" style={{ "--delay":"280ms", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem" } as React.CSSProperties}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Subjects</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"var(--foreground)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{grades.length}</p>
            <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)" }}>Recorded</p>
          </div>
        </div>

        {/* ── Recent grades ── */}
        <section>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <div>
              <h2 style={{ fontSize:"1rem", fontWeight:700, color:"var(--foreground)", letterSpacing:"-0.015em" }}>Recent grades</h2>
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)", marginTop:"0.125rem" }}>Most recent academic records</p>
            </div>
            <Link href="/student/profile" className="view-all-link" style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--color-primary)", textDecoration:"none", display:"flex", alignItems:"center", gap:"0.25rem" }}>
              Profile
              <svg className="va-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {recentGrades.length === 0 ? (
            <div className="glass-card">
              <div className="empty-state">
                <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
                <p className="empty-state-title">No grades yet</p>
                <p className="empty-state-body">Your grades will appear here once they have been recorded.</p>
              </div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, 22rem), 1fr))", gap:"0.75rem" }}>
              {recentGrades.map((g, idx) => {
                const grade = Number(g.grade);
                const hasScore = g.grade !== null && g.grade !== undefined;
                const letter = String(g.letter_grade || "");
                return (
                  <div key={String(g.id)} className="glass-card grade-card" style={{ "--delay":`${340+idx*60}ms`, padding:"1.125rem 1.25rem", display:"flex", alignItems:"center", gap:"1rem" } as React.CSSProperties}>
                    <span aria-hidden="true" style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--muted-foreground)", minWidth:"1.25rem", textAlign:"center", letterSpacing:"0.02em", opacity:0.6 }}>{String(idx+1).padStart(2,"0")}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{String(g.subject_name)}</p>
                      <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:"0.125rem" }}>{String(g.subject_code)}</p>
                      <div role="progressbar" aria-valuenow={grade} aria-valuemin={0} aria-valuemax={100} aria-label={hasScore ? `Score: ${grade}%` : "Score not recorded"} style={{ marginTop:"0.625rem", height:"3px", borderRadius:"9999px", background:"var(--border)" }}>
                        <div style={{ height:"3px", borderRadius:"9999px", background: grade >= 85 ? "var(--color-success)" : grade >= 70 ? "var(--color-primary)" : grade >= 55 ? "var(--color-warning)" : "var(--color-danger)", width:`${grade}%`, transition:"width 400ms cubic-bezier(0.16,1,0.3,1)" }} />
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"0.375rem", flexShrink:0 }}>
                      <span style={{ fontSize:"1.125rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.02em", lineHeight:1, fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{hasScore ? `${grade}%` : "—"}</span>
                      {letter && <span className={letterBadgeClass(letter)}>{letter}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </>
  );
}
