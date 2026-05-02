import Link from "next/link";
import { getDb } from "@/lib/db";
import { letterGradeToPoints } from "@/lib/gpa";

export default async function AdminDashboardPage() {
  const db = getDb();
  const totalStudents = (db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }).count;
  const totalDepartments = (db.prepare("SELECT COUNT(*) as count FROM departments").get() as { count: number }).count;
  const activeStudents = (db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").get() as { count: number }).count;
  const recentGrades = db
    .prepare(
      `SELECT g.*, s.name as student_name, s.student_id as student_code,
              sub.name as subject_name, sub.code as subject_code, sub.credits
       FROM grades g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       ORDER BY g.id DESC
       LIMIT 8`
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
  const averageGpa = gradeCredits
    ? gpaRows.reduce((sum, row) => sum + letterGradeToPoints(row.letter_grade) * Number(row.credits || 0), 0) / gradeCredits
    : 0;
  const metrics = [
    { label: "Students", value: totalStudents.toLocaleString(), detail: `${activeStudents.toLocaleString()} active` },
    { label: "Departments", value: totalDepartments.toLocaleString(), detail: "Academic units" },
    { label: "Average GPA", value: averageGpa ? averageGpa.toFixed(2) : "--", detail: `${gradeCredits.toLocaleString()} graded credits` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Academic operations</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">Dashboard</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/students/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Add Student
          </Link>
          <Link
            href="/admin/grades"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Enter Grades
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent grades</h2>
            <p className="text-sm text-muted-foreground">Latest recorded academic outcomes</p>
          </div>
          <Link href="/admin/grades" className="text-sm font-semibold text-primary hover:text-primary-dark">
            View all
          </Link>
        </div>
        <div className="p-5">
          {recentGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentGrades.slice(0, 8).map((item: Record<string, unknown>) => (
                <div key={String(item.id)} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{String(item.student_name)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(item.subject_name)} · {String(item.subject_code)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-sm font-semibold text-foreground">{String(item.grade)}%</span>
                    <span className="badge badge-primary">{String(item.letter_grade)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
