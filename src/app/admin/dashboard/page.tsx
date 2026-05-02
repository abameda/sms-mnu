import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { letterGradeToPoints } from "@/lib/gpa";

/** Safely coerce an unknown DB value to a display string, never showing "null" or "undefined". */
function safeStr(val: unknown, fallback = "—"): string {
  if (val === null || val === undefined || val === "") return fallback;
  return String(val);
}

/** Clamp a number to [0, 100]. */
function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export default async function AdminDashboardPage() {
  const db = getDb();
  const totalStudents = (db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }).count;
  const totalDepartments = (db.prepare("SELECT COUNT(*) as count FROM departments").get() as { count: number }).count;
  const activeStudents = (db.prepare(`SELECT COUNT(*) as count FROM students WHERE status = 'active'`).get() as { count: number }).count;
  const recentGrades = db
    .prepare(
      `SELECT g.*, s.name as student_name, s.student_id as student_code,
              sub.name as subject_name, sub.code as subject_code, sub.credits
       FROM grades g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       ORDER BY g.id DESC
       LIMIT 6`
    )
    .all() as Record<string, unknown>[];

  const gpaRows = db
    .prepare(
      `SELECT g.letter_grade, sub.credits
       FROM grades g
       LEFT JOIN subjects sub ON g.subject_id = sub.id`
    )
    .all() as { letter_grade: string; credits: number }[];
  const gradeCredits = gpaRows.reduce((sum, row) => sum + Number(row.credits || 0), 0);
  // Guard: only compute GPA when there are graded credits to avoid dividing by zero
  const hasGrades = gradeCredits > 0;
  const averageGpa = hasGrades
    ? gpaRows.reduce((sum, row) => sum + letterGradeToPoints(row.letter_grade) * Number(row.credits || 0), 0) / gradeCredits
    : null;

  // Enrollment rate: active / total
  const enrollmentRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  // GPA out of 4.0 as a percentage for the bar
  const gpaPercent = averageGpa !== null ? clampPct(Math.round((averageGpa / 4.0) * 100)) : 0;

  function letterGradeBadgeClass(grade: string): string {
    if (["A+", "A", "A-"].includes(grade)) return "badge-success";
    if (["B+", "B", "B-"].includes(grade)) return "badge-primary";
    if (["C+", "C", "C-"].includes(grade)) return "badge-warning";
    return "badge-danger";
  }

  return (
    <>
      {/* Ambient glow layer — fixed, pointer-events:none, z-index:0 */}
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <span className="dashboard-glow-orb3" aria-hidden="true" />

      {/* Responsive bento grid styles */}
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: auto;
          gap: 0.875rem;
        }
        .bento-col-5 { grid-column: span 5; grid-row: span 2; }
        .bento-col-4 { grid-column: span 4; }
        .bento-col-3 { grid-column: span 3; }

        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .bento-col-5,
          .bento-col-4,
          .bento-col-3 {
            grid-column: 1 / -1;
            grid-row: auto;
          }
          .bento-hero {
            min-height: 200px !important;
          }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .bento-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .bento-col-5 { grid-column: span 6; grid-row: span 2; }
          .bento-col-4 { grid-column: span 3; }
          .bento-col-3 { grid-column: span 3; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>

      {/* ── Page header ── */}
      <div className="dashboard-header" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <p style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
        }}>
          Academic operations
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--foreground)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}>
            Dashboard
          </h1>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            <Link
              href="/admin/students/new"
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
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              Add Student
            </Link>
            <Link
              href="/admin/grades"
              className="btn-ghost-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                padding: "0.5rem 1.125rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Enter Grades
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="bento-grid">

        {/* Cell A — Students (committed blue surface, spans 5 cols × tall row) */}
        <div className="bento-cell bento-hero bento-col-5" style={{
          "--delay": "120ms",
          borderRadius: "1rem",
          background: "oklch(0.26 0.09 175)",
          padding: "2rem 2rem 1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "220px",
          position: "relative",
          overflow: "hidden",
        } as React.CSSProperties}>
          <div style={{
            position: "absolute",
            right: "-3rem",
            top: "-3rem",
            width: "14rem",
            height: "14rem",
            borderRadius: "50%",
            border: "2px solid oklch(0.55 0.10 175)",
            opacity: 0.35,
            pointerEvents: "none",
          }} aria-hidden="true" />
          <div style={{
            position: "absolute",
            right: "1rem",
            bottom: "-2rem",
            width: "9rem",
            height: "9rem",
            borderRadius: "50%",
            border: "1.5px solid oklch(0.55 0.10 175)",
            opacity: 0.2,
            pointerEvents: "none",
          }} aria-hidden="true" />

          <div>
            <p style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "oklch(0.78 0.08 175)",
            }}>
              Total Students
            </p>
            <p style={{
              fontSize: "4.5rem",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "oklch(0.96 0.015 90)",
              marginTop: "0.5rem",
              fontVariantNumeric: "tabular-nums",
            } as React.CSSProperties}>
              {totalStudents.toLocaleString("en-US")}
            </p>
          </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {/* Enrollment bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.75 0.06 175)" }}>
                    Active enrollment
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "oklch(0.96 0.015 90)" }}>
                    {totalStudents > 0 ? `${enrollmentRate}%` : "—"}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={enrollmentRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Active enrollment: ${enrollmentRate}%`}
                  style={{
                    height: "4px",
                    borderRadius: "9999px",
                    background: "oklch(0.38 0.07 175)",
                  }}
                >
                  <div style={{
                    height: "4px",
                    borderRadius: "9999px",
                    background: "oklch(0.85 0.14 50)",
                    width: `${enrollmentRate}%`,
                    transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
                  }} />
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "oklch(0.65 0.06 175)" }}>
                {totalStudents > 0
                  ? `${activeStudents.toLocaleString("en-US")} active of ${totalStudents.toLocaleString("en-US")} enrolled`
                  : "No students enrolled yet"}
              </p>
            </div>
        </div>

        {/* Cell B — Departments (compact, 4 cols) */}
        <div
          className="glass-card bento-cell bento-col-4"
          style={{
            "--delay": "200ms",
            padding: "1.5rem 1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.75rem",
          } as React.CSSProperties}
        >
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}>
            Departments
          </p>
          <p style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
          }}>
            {totalDepartments.toLocaleString("en-US")}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
            Academic units
          </p>
        </div>

        {/* Cell C — Quick actions (3 cols) */}
        <div
          className="glass-card bento-cell bento-col-3"
          style={{
            "--delay": "280ms",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          } as React.CSSProperties}
        >
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: "0.25rem",
          }}>
            Quick actions
          </p>
          {[
            { label: "Manage students", href: "/admin/students" },
            { label: "Grade entry", href: "/admin/grades" },
            { label: "Departments", href: "/admin/departments" },
            { label: "Subjects", href: "/admin/subjects" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="quick-action-link"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {action.label}
              {/* Arrow flips in RTL via CSS — see globals.css [dir=rtl] rule */}
              <svg className="qa-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>

        {/* Cell D — Average GPA (spans 4 cols, second row) */}
        <div
          className="glass-card bento-cell bento-col-4"
          style={{
            "--delay": "340ms",
            padding: "1.5rem 1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.75rem",
          } as React.CSSProperties}
        >
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}>
            Average GPA
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <p style={{
              fontSize: "3.5rem",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
              fontVariantNumeric: "tabular-nums",
            } as React.CSSProperties}>
              {averageGpa !== null ? averageGpa.toFixed(2) : "—"}
            </p>
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--muted-foreground)" }}>/ 4.0</span>
          </div>
          <div>
            <div
              role="progressbar"
              aria-valuenow={gpaPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={averageGpa !== null ? `Average GPA: ${averageGpa.toFixed(2)} out of 4.0` : "No GPA data yet"}
              style={{ height: "4px", borderRadius: "9999px", background: "var(--border)" }}
            >
              <div style={{
                height: "4px",
                borderRadius: "9999px",
                background: "var(--color-primary)",
                width: `${gpaPercent}%`,
                transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
              {hasGrades ? `${gradeCredits.toLocaleString("en-US")} graded credits` : "No grades recorded yet"}
            </p>
          </div>
        </div>

        {/* Cell E — Grade distribution (3 cols, second row) */}
        <div
          className="glass-card bento-cell bento-col-3"
          style={{
            "--delay": "400ms",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          } as React.CSSProperties}
        >
          <p style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}>
            Grade distribution
          </p>
          {(["A", "B", "C", "D"] as const).map((tier, i) => {
            const tierMap: Record<string, number> = {
              A: gpaRows.filter(r => r.letter_grade?.startsWith("A")).length,
              B: gpaRows.filter(r => r.letter_grade?.startsWith("B")).length,
              C: gpaRows.filter(r => r.letter_grade?.startsWith("C")).length,
              D: gpaRows.filter(r => r.letter_grade?.startsWith("D") || r.letter_grade === "F").length,
            };
            const tierColors: Record<string, string> = {
              A: "var(--color-success)",
              B: "var(--color-primary)",
              C: "var(--color-warning)",
              D: "var(--color-danger)",
            };
            const total = gpaRows.length;
            const count = tierMap[tier] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={tier}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Grade ${tier}: ${count} of ${total} (${pct}%)`}
                style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
              >
                <span style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  width: "1rem",
                  color: "var(--muted-foreground)",
                }}>
                  {tier}
                </span>
                <div style={{ flex: 1, height: "5px", borderRadius: "9999px", background: "var(--border)" }}>
                  <div style={{
                    height: "5px",
                    borderRadius: "9999px",
                    background: total > 0 ? tierColors[tier] : "var(--border)",
                    width: `${pct}%`,
                    transition: `width ${500 + i * 80}ms cubic-bezier(0.16,1,0.3,1)`,
                  }} />
                </div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--muted-foreground)", width: "2.25rem", textAlign: "right" }}>
                  {total > 0 ? `${pct}%` : "—"}
                </span>
              </div>
            );
          })}
        </div>

      </div>{/* /bento grid */}

      {/* ── Recent grades feed ── */}
      <section>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}>
          <div>
            <h2 style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.015em",
            }}>
              Recent grades
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", marginTop: "0.125rem" }}>
              Latest recorded academic outcomes
            </p>
          </div>
          <Link
            href="/admin/grades"
            className="view-all-link"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            View all
            <svg className="va-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {recentGrades.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>No grades recorded yet</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", maxWidth: "28ch" }}>Enter the first grade to see outcomes appear here.</p>
            <Link
              href="/admin/grades"
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
                textDecoration: "none",
              }}
            >
              Enter grades
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 22rem), 1fr))",
            gap: "0.75rem",
          }}>
            {recentGrades.map((item: Record<string, unknown>, idx: number) => {
              const rawGrade = Number(item.grade);
              const grade = Number.isFinite(rawGrade) ? clampPct(rawGrade) : 0;
              const hasScore = item.grade !== null && item.grade !== undefined;
              const letter = safeStr(item.letter_grade, "");
              const studentName = safeStr(item.student_name, "Unknown student");
              const subjectName = safeStr(item.subject_name, "Unknown subject");
              const subjectCode = safeStr(item.subject_code, "");
              return (
                <div
                  key={item.id !== undefined ? String(item.id) : `grade-${idx}`}
                  className="glass-card grade-card"
                  style={{
                    "--delay": `${460 + idx * 60}ms`,
                    padding: "1.125rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  } as React.CSSProperties}
                >
                  {/* Index / rank */}
                  <span aria-hidden="true" style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--muted-foreground)",
                    minWidth: "1.25rem",
                    textAlign: "center",
                    letterSpacing: "0.02em",
                    opacity: 0.6,
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {studentName}
                    </p>
                    <p style={{
                      fontSize: "0.75rem",
                      color: "var(--muted-foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "0.125rem",
                    }}>
                      {subjectCode ? `${subjectName} · ${subjectCode}` : subjectName}
                    </p>
                    {/* Grade bar */}
                    <div
                      role="progressbar"
                      aria-valuenow={grade}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={hasScore ? `Score: ${grade}%` : "Score not recorded"}
                      style={{ marginTop: "0.625rem", height: "3px", borderRadius: "9999px", background: "var(--border)" }}
                    >
                      <div style={{
                        height: "3px",
                        borderRadius: "9999px",
                        background: grade >= 85 ? "var(--color-success)" : grade >= 70 ? "var(--color-primary)" : grade >= 55 ? "var(--color-warning)" : "var(--color-danger)",
                        width: `${grade}%`,
                        transition: "width 400ms cubic-bezier(0.16,1,0.3,1)",
                      }} />
                    </div>
                  </div>

                  {/* Score + badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.375rem", flexShrink: 0 }}>
                    <span style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "var(--foreground)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    } as React.CSSProperties}>
                      {hasScore ? `${grade}%` : "—"}
                    </span>
                    {letter && (
                      <span className={`badge ${letterGradeBadgeClass(letter)}`}>
                        {letter}
                      </span>
                    )}
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
