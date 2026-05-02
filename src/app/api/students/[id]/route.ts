import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { letterGradeToPoints } from "@/lib/gpa";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const student = db
      .prepare(
        `SELECT s.*, d.name as department_name
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE s.id = ?`
      )
      .get(id);

    if (!student) {
      return Response.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const grades = db
      .prepare(
        `SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits
         FROM grades g
         LEFT JOIN subjects sub ON g.subject_id = sub.id
         WHERE g.student_id = ?`
      )
      .all(id) as (import("@/lib/types").Grade & {
      subject_name: string;
      subject_code: string;
      credits: number;
    })[];

    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of grades) {
      totalPoints += letterGradeToPoints(g.letter_grade) * g.credits;
      totalCredits += g.credits;
    }
    const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

    return Response.json({
      success: true,
      data: { ...student, gpa },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch student";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, student_id, email, phone, department_id, year, enrollment_year, status } = body;

    db.transaction(() => {
      db
        .prepare(
          `UPDATE students SET
            name = COALESCE(?, name),
            student_id = COALESCE(?, student_id),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            department_id = COALESCE(?, department_id),
            year = COALESCE(?, year),
            enrollment_year = COALESCE(?, enrollment_year),
            status = COALESCE(?, status)
           WHERE id = ?`
        )
        .run(
          name || null,
          student_id || null,
          email !== undefined ? email : null,
          phone !== undefined ? phone : null,
          department_id || null,
          year || null,
          enrollment_year || null,
          status || null,
          id
        );

      if (student_id) {
        db.prepare("UPDATE users SET username = ? WHERE role = 'student' AND student_id = ?").run(student_id, id);
      }
    })();

    const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
    auditLog(userId, "UPDATE", "students", parseInt(id, 10), JSON.stringify(existing), JSON.stringify(updated));
    return Response.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update student";
    if (message.includes("UNIQUE")) {
      return Response.json({ success: false, error: "Student ID already exists" }, { status: 409 });
    }
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM grades WHERE student_id = ?").run(id);
    db.prepare("DELETE FROM students WHERE id = ?").run(id);
    auditLog(userId, "DELETE", "students", parseInt(id, 10), JSON.stringify(existing), null);

    return Response.json({ success: true, data: { message: "Student and associated grades deleted" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete student";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
