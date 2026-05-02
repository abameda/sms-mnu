"use client";

import { useState, useEffect } from "react";

interface StudentsByDepartment { department_name: string; department_code: string; student_count: number; }
interface RecentGrade { id: number; student_name: string; student_code: string; subject_name: string; subject_code: string; grade: number; letter_grade: string; semester: string; academic_year: string; }
interface StudentsByStatus { status: string; count: number; }
interface StudentsByYear { year: number; count: number; }
interface StatsData {
  totalStudents: number; totalDepartments: number; totalSubjects: number; totalGrades: number; activeStudents: number;
  studentsByDepartment: StudentsByDepartment[]; recentGrades: RecentGrade[];
  studentsByStatus: StudentsByStatus[]; studentsByYear: StudentsByYear[];
}

const statusBadgeClass = (status: string) => {
  if (status === "active") return "badge-status-active";
  if (status === "graduated") return "badge-status-graduated";
  if (status === "suspended") return "badge-status-suspended";
  return "badge badge-primary";
};

const statusBarColor = (status: string) => {
  if (status === "active") return "var(--color-success)";
  if (status === "graduated") return "var(--color-primary)";
  return "var(--color-danger)";
};

function letterBadgeClass(letter: string): string {
  if (letter.startsWith("A")) return "badge badge-success";
  if (letter.startsWith("B")) return "badge badge-primary";
  if (letter.startsWith("C")) return "badge badge-warning";
  return "badge badge-danger";
}

export default function ReportsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const graduatedCount = data?.studentsByStatus?.find(s => s.status.toLowerCase() === "graduated")?.count ?? 0;

  if (loading) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>
          <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
            <div className="skeleton-line" style={{ width:"8rem" }} />
            <div className="skeleton-line" style={{ width:"14rem", height:"2rem", marginTop:"0.5rem" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.875rem" }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height:"7rem", borderRadius:"0.875rem", animationDelay:`${i*80}ms` }} />)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div className="skeleton" style={{ height:"16rem", borderRadius:"1rem" }} />
            <div className="skeleton" style={{ height:"16rem", borderRadius:"1rem" }} />
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="glass-card" style={{ padding:"4rem 2rem", textAlign:"center" }}>
        <p style={{ color:"var(--muted-foreground)" }}>Failed to load report data.</p>
      </div>
    );
  }

  const overviewItems = [
    { label: "Total Students", value: data.totalStudents, color: "oklch(0.26 0.09 175)" },
    { label: "Active Students", value: data.activeStudents, color: "oklch(0.24 0.07 145)" },
    { label: "Graduated", value: graduatedCount, color: "oklch(0.26 0.06 50)" },
    { label: "Departments", value: data.totalDepartments, color: "oklch(0.24 0.06 200)" },
  ];

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Analytics</p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Reports</h1>
            <button onClick={() => window.print()} className="btn-ghost-cta no-print" style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", borderRadius:"0.5rem", border:"1px solid var(--border)", background:"var(--card)", color:"var(--foreground)", padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm8-12V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4h10z"/></svg>
              Print
            </button>
          </div>
        </div>

        {/* Overview mini-bento */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(100%, 11rem), 1fr))", gap:"0.875rem" }}>
          {overviewItems.map((item, i) => (
            <div key={item.label} className="bento-cell" style={{ "--delay":`${120+i*80}ms`, borderRadius:"0.875rem", background: item.color, padding:"1.5rem 1.75rem", display:"flex", flexDirection:"column", gap:"0.5rem" } as React.CSSProperties}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"oklch(0.80 0.04 220)" }}>{item.label}</p>
              <p style={{ fontSize:"2.75rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.04em", color:"oklch(0.96 0.015 90)", fontVariantNumeric:"tabular-nums" } as React.CSSProperties}>{item.value.toLocaleString("en-US")}</p>
            </div>
          ))}
        </div>

        {/* By Department + By Year */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%,24rem), 1fr))", gap:"1rem" }}>

          <div className="glass-card section-card" style={{ "--delay":"360ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
            <p className="section-heading">Students by Department</p>
            {data.studentsByDepartment.length === 0 ? (
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>No data available.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {data.studentsByDepartment.map(dept => {
                  const max = Math.max(...data.studentsByDepartment.map(d => d.student_count), 1);
                  const pct = (dept.student_count / max) * 100;
                  return (
                    <div key={dept.department_code} style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.25rem" }}>
                          <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{dept.department_name}</span>
                          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--muted-foreground)", flexShrink:0, marginLeft:"0.5rem" }}>{dept.student_count}</span>
                        </div>
                        <div style={{ height:"4px", borderRadius:"9999px", background:"var(--border)" }}>
                          <div style={{ height:"4px", borderRadius:"9999px", background:"var(--color-teal)", width:`${pct}%`, transition:"width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)", marginTop:"0.5rem", paddingTop:"0.5rem", borderTop:"1px solid var(--border)" }}>
                  {data.studentsByDepartment.reduce((s, d) => s + d.student_count, 0)} students across {data.studentsByDepartment.length} departments
                </p>
              </div>
            )}
          </div>

          <div className="glass-card section-card" style={{ "--delay":"440ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
            <p className="section-heading">Students by Year</p>
            {data.studentsByYear.length === 0 ? (
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>No data available.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {data.studentsByYear.map(y => {
                  const total = data.studentsByYear.reduce((s, item) => s + item.count, 0);
                  const pct = total > 0 ? (y.count / total) * 100 : 0;
                  return (
                    <div key={y.year} style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                      <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--muted-foreground)", width:"3.5rem", flexShrink:0 }}>Year {y.year}</span>
                      <div style={{ flex:1, height:"4px", borderRadius:"9999px", background:"var(--border)" }}>
                        <div style={{ height:"4px", borderRadius:"9999px", background:"var(--color-primary)", width:`${pct}%`, transition:"width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
                      </div>
                      <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--foreground)", width:"2rem", textAlign:"right", flexShrink:0 }}>{y.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status + Recent Grades */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%,24rem), 1fr))", gap:"1rem" }}>

          <div className="glass-card section-card" style={{ "--delay":"520ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
            <p className="section-heading">Students by Status</p>
            {data.studentsByStatus.length === 0 ? (
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>No data available.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                {data.studentsByStatus.map(s => {
                  const total = data.studentsByStatus.reduce((sum, item) => sum + item.count, 0);
                  const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={s.status} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
                      <span className={statusBadgeClass(s.status)} style={{ textTransform:"capitalize" }}>{s.status}</span>
                      <div style={{ flex:1, height:"4px", borderRadius:"9999px", background:"var(--border)", maxWidth:"8rem" }}>
                        <div style={{ height:"4px", borderRadius:"9999px", background: statusBarColor(s.status), width:`${pct}%`, transition:"width 500ms cubic-bezier(0.16,1,0.3,1)" }} />
                      </div>
                      <span style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--foreground)", minWidth:"2rem", textAlign:"right" }}>{s.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card section-card" style={{ "--delay":"600ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
            <p className="section-heading">Recent Grade Entries</p>
            {data.recentGrades.length === 0 ? (
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>No grades recorded yet.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {data.recentGrades.map((g, idx) => (
                  <div key={g.id} style={{ display:"flex", alignItems:"center", gap:"0.875rem", paddingBottom: idx < data.recentGrades.length - 1 ? "0.75rem" : 0, borderBottom: idx < data.recentGrades.length - 1 ? "1px solid oklch(0.26 0.008 220 / 0.5)" : "none" }}>
                    <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--muted-foreground)", opacity:0.6, minWidth:"1.25rem", textAlign:"center" }}>{String(idx+1).padStart(2,"0")}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.student_name}</p>
                      <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.subject_name}</p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"0.25rem", flexShrink:0 }}>
                      <span style={{ fontSize:"1rem", fontWeight:800, color:"var(--foreground)", letterSpacing:"-0.02em" }}>{g.grade}</span>
                      <span className={letterBadgeClass(g.letter_grade)}>{g.letter_grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
