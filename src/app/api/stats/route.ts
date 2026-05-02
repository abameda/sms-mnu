import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const totalStudents = (db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }).count;
    const totalDepartments = (db.prepare("SELECT COUNT(*) as count FROM departments").get() as { count: number }).count;
    const totalSubjects = (db.prepare("SELECT COUNT(*) as count FROM subjects").get() as { count: number }).count;
    const totalGrades = (db.prepare("SELECT COUNT(*) as count FROM grades").get() as { count: number }).count;
    const activeStudents = (db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").get() as { count: number }).count;

    const studentsByDepartment = db
      .prepare(
        `SELECT d.name as department_name, d.code as department_code, COUNT(s.id) as student_count
         FROM departments d
         LEFT JOIN students s ON d.id = s.department_id
         GROUP BY d.id
         ORDER BY student_count DESC`
      )
      .all();

    const recentGrades = db
      .prepare(
        `SELECT g.*, s.name as student_name, s.student_id as student_code,
                sub.name as subject_name, sub.code as subject_code
         FROM grades g
         LEFT JOIN students s ON g.student_id = s.id
         LEFT JOIN subjects sub ON g.subject_id = sub.id
         ORDER BY g.id DESC
         LIMIT 10`
      )
      .all();

    const studentsByStatus = db
      .prepare(
        `SELECT status, COUNT(*) as count FROM students GROUP BY status`
      )
      .all();

    const studentsByYear = db
      .prepare(
        `SELECT year, COUNT(*) as count FROM students GROUP BY year ORDER BY year`
      )
      .all();

    return Response.json({
      success: true,
      data: {
        totalStudents,
        totalDepartments,
        totalSubjects,
        totalGrades,
        activeStudents,
        studentsByDepartment,
        recentGrades,
        studentsByStatus,
        studentsByYear,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
