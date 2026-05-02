import { getServerSession } from "next-auth";
import { getDb, auditLog, hashPassword } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import type { PaginatedResponse, Student } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const db = getDb();
    const offset = (page - 1) * limit;

    let countQuery = "SELECT COUNT(*) as total FROM students";
    let dataQuery = `
      SELECT s.*, d.name as department_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
    `;
    const params: (string | number)[] = [];

    if (search) {
      const where = " WHERE s.name LIKE ? OR s.student_id LIKE ?";
      countQuery += where;
      dataQuery += where;
      params.push(`%${search}%`, `%${search}%`);
    }

    dataQuery += " ORDER BY s.id LIMIT ? OFFSET ?";
    const total = (db.prepare(countQuery).get(...params) as { total: number }).total;
    const students = db.prepare(dataQuery).all(...params, limit, offset);

    const response: PaginatedResponse<Student & { department_name: string }> = {
      data: students as (Student & { department_name: string })[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return Response.json({ success: true, ...response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch students";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const body = await request.json();
    const { name, student_id, email, phone, department_id, year, enrollment_year, status } = body;

    if (!name || !department_id || !year || !enrollment_year) {
      return Response.json(
        { success: false, error: "Name, department_id, year, and enrollment_year are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const dept = db.prepare("SELECT id FROM departments WHERE id = ?").get(department_id);
    if (!dept) {
      return Response.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    let finalStudentId = student_id;
    if (!finalStudentId) {
      const lastStudent = db
        .prepare("SELECT student_id FROM students ORDER BY id DESC LIMIT 1")
        .get() as { student_id: string } | undefined;
      const lastNum = lastStudent ? parseInt(lastStudent.student_id, 10) : 20200000;
      finalStudentId = String(lastNum + 1);
    }

    const studentPassword = await hashPassword("student");
    const result = db.transaction(() => {
      const inserted = db
        .prepare(
          `INSERT INTO students (name, student_id, email, phone, department_id, year, enrollment_year, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(name, finalStudentId, email || null, phone || null, department_id, year, enrollment_year, status || "active");

      db.prepare("INSERT INTO users (username, password, role, student_id) VALUES (?, ?, 'student', ?)")
        .run(finalStudentId, studentPassword, inserted.lastInsertRowid);

      return inserted;
    })();

    const newData = {
      id: result.lastInsertRowid,
      name,
      student_id: finalStudentId,
      email: email || null,
      phone: phone || null,
      department_id,
      year,
      enrollment_year,
      status: status || "active",
    };
    auditLog(userId, "CREATE", "students", Number(result.lastInsertRowid), null, JSON.stringify(newData));

    return Response.json(
      { success: true, data: newData },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create student";
    if (message.includes("UNIQUE")) {
      return Response.json({ success: false, error: "Student ID already exists" }, { status: 409 });
    }
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
