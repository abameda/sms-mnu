import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { letterGradeToPoints } from "@/lib/gpa";
import StudentDetailContent from "./StudentDetailContent";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const db = getDb();
  const student = db
    .prepare(
      `SELECT s.*, d.name as department_name
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.id = ?`
    )
    .get(id) as Record<string, unknown> | undefined;

  const grades = student
    ? db
        .prepare(
          `SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits
           FROM grades g
           LEFT JOIN subjects sub ON g.subject_id = sub.id
           WHERE g.student_id = ?
           ORDER BY g.academic_year DESC, g.id DESC`
        )
        .all(id) as Record<string, unknown>[]
    : [];

  const totalCredits = grades.reduce((sum, grade) => sum + Number(grade.credits || 0), 0);
  const totalPoints = grades.reduce(
    (sum, grade) => sum + letterGradeToPoints(String(grade.letter_grade)) * Number(grade.credits || 0),
    0
  );
  const gpa = totalCredits ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

  if (!student) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Student Not Found</h1>
        <p className="text-gray-500 mt-2">The student you are looking for does not exist.</p>
        <Link href="/admin/students" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Students
        </Link>
      </div>
    );
  }

  return <StudentDetailContent student={{ ...student, grades, gpa } as never} studentDbId={id} />;
}
