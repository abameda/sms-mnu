import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateLetterGrade } from "@/lib/gpa";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const grade = db
      .prepare(
        `SELECT g.*, s.name as student_name, s.student_id as student_code,
                sub.name as subject_name, sub.code as subject_code, sub.credits
         FROM grades g
         LEFT JOIN students s ON g.student_id = s.id
         LEFT JOIN subjects sub ON g.subject_id = sub.id
         WHERE g.id = ?`
      )
      .get(id);

    if (!grade) {
      return Response.json({ success: false, error: "Grade not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: grade });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch grade";
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

    const existing = db.prepare("SELECT * FROM grades WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Grade not found" }, { status: 404 });
    }

    const body = await request.json();
    const { grade, semester, academic_year } = body;

    const newGrade = grade !== undefined ? grade : (existing as { grade: number }).grade;
    const newLetterGrade = grade !== undefined ? calculateLetterGrade(grade) : (existing as { letter_grade: string }).letter_grade;

    db.prepare(
      `UPDATE grades SET
        grade = COALESCE(?, grade),
        letter_grade = ?,
        semester = COALESCE(?, semester),
        academic_year = COALESCE(?, academic_year)
       WHERE id = ?`
    ).run(grade ?? null, newLetterGrade, semester || null, academic_year || null, id);

    const updated = db.prepare("SELECT * FROM grades WHERE id = ?").get(id);
    auditLog(userId, "UPDATE", "grades", parseInt(id, 10), JSON.stringify(existing), JSON.stringify(updated));
    return Response.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update grade";
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

    const existing = db.prepare("SELECT * FROM grades WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Grade not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM grades WHERE id = ?").run(id);
    auditLog(userId, "DELETE", "grades", parseInt(id, 10), JSON.stringify(existing), null);
    return Response.json({ success: true, data: { message: "Grade deleted" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete grade";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
