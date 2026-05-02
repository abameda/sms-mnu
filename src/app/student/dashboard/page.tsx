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
      .prepare(
        `SELECT s.*, d.name as department_name
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE s.id = ?`
      )
      .get(studentId) as (Record<string, unknown> & { name: string; year: number; department_name: string }) | null;

    grades = db
      .prepare(
        `SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits
         FROM grades g
         LEFT JOIN subjects sub ON g.subject_id = sub.id
         WHERE g.student_id = ?
         ORDER BY g.academic_year DESC, g.id DESC`
      )
      .all(studentId) as Record<string, unknown>[];

    const totalPoints = grades.reduce(
      (sum, grade) => sum + letterGradeToPoints(String(grade.letter_grade)) * Number(grade.credits || 0),
      0
    );
    const totalGradeCredits = grades.reduce((sum, grade) => sum + Number(grade.credits || 0), 0);
    gpa = totalGradeCredits ? Math.round((totalPoints / totalGradeCredits) * 100) / 100 : 0;
  }

  const recentGrades = grades.slice(0, 5);
  const totalCredits = grades.reduce((sum: number, g) => sum + (Number(g.credits) || 0), 0);
  const currentYear = student ? `Year ${student.year}` : "N/A";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">{student?.department_name || "Student portal"}</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{student?.name || userName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{currentYear}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/student/grades"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              View Grades
            </Link>
            <Link
              href="/student/transcript"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Transcript
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{typeof gpa === "number" ? gpa.toFixed(2) : "N/A"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Credits</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalCredits}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Recorded grades</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{grades.length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent grades</h2>
            <p className="text-sm text-muted-foreground">Most recent academic records</p>
          </div>
          <Link href="/student/profile" className="text-sm font-semibold text-primary hover:text-primary-dark">
            Profile
          </Link>
        </div>
        <div className="p-5">
          {recentGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentGrades.map((g) => (
                <div key={String(g.id)} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{String(g.subject_name)}</p>
                    <p className="truncate text-xs text-muted-foreground">{String(g.subject_code)}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-sm font-semibold text-foreground">{String(g.grade)}%</span>
                    <span className="badge badge-primary">{String(g.letter_grade)}</span>
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
