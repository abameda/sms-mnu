"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { letterGradeToPoints } from "@/lib/gpa";

interface Grade {
  id: number; subject_name: string; subject_code: string;
  credits: number; grade: number; letter_grade: string;
  semester: string; academic_year: string;
}

function letterBadgeClass(letter: string): string {
  if (["A+","A","A-"].includes(letter)) return "badge badge-success";
  if (["B+","B","B-"].includes(letter)) return "badge badge-primary";
  if (["C+","C","C-"].includes(letter)) return "badge badge-warning";
  return "badge badge-danger";
}

export default function StudentGradesPage() {
  const { data: session, status } = useSession();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    const studentId = (session?.user as { student_id?: number | null } | null)?.student_id;
    if (!studentId) { setLoading(false); return; }
    fetch(`/api/grades?student_id=${studentId}`)
      .then(r => r.json()).then(j => { if (j.success) setGrades(j.data); })
      .finally(() => setLoading(false));
  }, [session, status]);

  const semesterMap = new Map<string, { grades: Grade[]; gpa: number; totalCredits: number }>();
  for (const g of grades) {
    const key = `${g.semester} - ${g.academic_year}`;
    if (!semesterMap.has(key)) semesterMap.set(key, { grades: [], gpa: 0, totalCredits: 0 });
    semesterMap.get(key)!.grades.push(g);
  }

  let cumulativePoints = 0;
  let cumulativeCredits = 0;
  for (const [, semData] of semesterMap) {
    let semPoints = 0, semCredits = 0;
    for (const g of semData.grades) {
      semPoints += letterGradeToPoints(g.letter_grade) * g.credits;
      semCredits += g.credits;
    }
    semData.gpa = semCredits > 0 ? Math.round((semPoints / semCredits) * 100) / 100 : 0;
    semData.totalCredits = semCredits;
    cumulativePoints += semPoints;
    cumulativeCredits += semCredits;
  }
  const cumulativeGPA = cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 : 0;
  const gpaPercent = Math.min(100, Math.round((cumulativeGPA / 4.0) * 100));

  if (loading) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>
          <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            <div className="skeleton-line" style={{ width:"6rem" }} />
            <div className="skeleton-line" style={{ width:"12rem", height:"2rem" }} />
          </div>
          <div className="student-stat-strip">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height:"7rem", borderRadius:"0.875rem", animationDelay:`${i*80}ms` }} />)}
          </div>
        </div>
      </>
    );
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

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Academic record</p>
          <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>My Grades</h1>
          <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>Recorded marks and semester performance</p>
        </div>

        {/* Stats strip */}
        <div className="student-stat-strip">
          <div className="bento-cell" style={{ "--delay":"120ms", borderRadius:"1rem", background:"oklch(0.26 0.09 175)", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem", position:"relative", overflow:"hidden" } as React.CSSProperties}>
            <div style={{ position:"absolute", right:"-2rem", top:"-2rem", width:"9rem", height:"9rem", borderRadius:"50%", border:"2px solid oklch(0.55 0.10 175)", opacity:0.3, pointerEvents:"none" }} aria-hidden="true" />
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"oklch(0.78 0.08 175)" }}>Cumulative GPA</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"oklch(0.96 0.015 90)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>
              {cumulativeCredits > 0 ? cumulativeGPA.toFixed(2) : "—"}
            </p>
            <div>
              <div style={{ height:"4px", borderRadius:"9999px", background:"oklch(0.38 0.07 175)" }}>
                <div style={{ height:"4px", borderRadius:"9999px", background:"oklch(0.85 0.14 50)", width:`${gpaPercent}%`, transition:"width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
              <p style={{ fontSize:"0.75rem", color:"oklch(0.65 0.06 175)", marginTop:"0.25rem" }}>Out of 4.00</p>
            </div>
          </div>
          <div className="glass-card bento-cell" style={{ "--delay":"200ms", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem" } as React.CSSProperties}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Credits</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"var(--foreground)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{cumulativeCredits}</p>
            <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)" }}>Graded</p>
          </div>
          <div className="glass-card bento-cell" style={{ "--delay":"280ms", padding:"1.75rem 1.75rem 1.5rem", display:"flex", flexDirection:"column", gap:"0.5rem" } as React.CSSProperties}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Subjects</p>
            <p style={{ fontSize:"3rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"var(--foreground)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{grades.length}</p>
            <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)" }}>Recorded</p>
          </div>
        </div>

        {/* Semester sections */}
        {semesterMap.size === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
              <p className="empty-state-title">No grades recorded</p>
              <p className="empty-state-body">Your grades will appear here once they have been entered.</p>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
            {Array.from(semesterMap.entries()).map(([label, semData], idx) => (
              <section key={label} className="glass-card section-card" style={{ "--delay":`${340+idx*80}ms`, overflow:"hidden", padding:0 } as React.CSSProperties}>
                <div className="semester-band">
                  <div>
                    <p className="semester-band-label">{label}</p>
                    <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)", marginTop:"0.125rem" }}>{semData.grades.length} subjects</p>
                  </div>
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    <span className="semester-badge semester-badge-credits">Credits {semData.totalCredits}</span>
                    <span className="semester-badge semester-badge-gpa">GPA {semData.gpa.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table className="data-table">
                    <thead><tr>
                      <th>Subject</th><th>Code</th>
                      <th style={{ textAlign:"center" }}>Credits</th>
                      <th style={{ textAlign:"center" }}>Grade</th>
                      <th style={{ textAlign:"center" }}>Letter</th>
                    </tr></thead>
                    <tbody>
                      {semData.grades.map(g => (
                        <tr key={g.id}>
                          <td>{g.subject_name}</td>
                          <td className="muted">{g.subject_code}</td>
                          <td style={{ textAlign:"center" }}>{g.credits}</td>
                          <td style={{ textAlign:"center", fontWeight:700 }}>{g.grade}%</td>
                          <td style={{ textAlign:"center" }}><span className={letterBadgeClass(g.letter_grade)}>{g.letter_grade}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
