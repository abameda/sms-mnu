import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateLetterGrade } from "@/lib/gpa";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const semester = searchParams.get("semester");

    const db = getDb();

    let query = `
      SELECT g.*, s.name as student_name, s.student_id as student_code,
             sub.name as subject_name, sub.code as subject_code, sub.credits
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN subjects sub ON g.subject_id = sub.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (studentId) {
      query += " AND g.student_id = ?";
      params.push(parseInt(studentId, 10));
    }
    if (semester) {
      query += " AND g.semester = ?";
      params.push(semester);
    }

    query += " ORDER BY g.id DESC";

    const grades = db.prepare(query).all(...params);
    return Response.json({ success: true, data: grades });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch grades";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const body = await request.json();
    const { student_id, subject_id, grade, semester, academic_year } = body;

    if (!student_id || !subject_id || grade === undefined || !semester || !academic_year) {
      return Response.json(
        { success: false, error: "student_id, subject_id, grade, semester, and academic_year are required" },
        { status: 400 }
      );
    }

    if (grade < 0 || grade > 100) {
      return Response.json({ success: false, error: "Grade must be between 0 and 100" }, { status: 400 });
    }

    const db = getDb();

    const student = db.prepare("SELECT id FROM students WHERE id = ?").get(student_id);
    if (!student) {
      return Response.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const subject = db.prepare("SELECT id FROM subjects WHERE id = ?").get(subject_id);
    if (!subject) {
      return Response.json({ success: false, error: "Subject not found" }, { status: 404 });
    }

    const letterGrade = calculateLetterGrade(grade);

    const result = db
      .prepare(
        `INSERT INTO grades (student_id, subject_id, grade, letter_grade, semester, academic_year)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(student_id, subject_id, grade, letterGrade, semester, academic_year);

    const newData = {
      id: result.lastInsertRowid,
      student_id,
      subject_id,
      grade,
      letter_grade: letterGrade,
      semester,
      academic_year,
    };
    auditLog(userId, "CREATE", "grades", Number(result.lastInsertRowid), null, JSON.stringify(newData));

    return Response.json(
      { success: true, data: newData },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create grade";
    if (message.includes("UNIQUE")) {
      return Response.json(
        { success: false, error: "Grade already exists for this student, subject, semester, and academic year" },
        { status: 409 }
      );
    }
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
