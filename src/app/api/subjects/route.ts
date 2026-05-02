import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("department_id");
    const semester = searchParams.get("semester");
    const year = searchParams.get("year");

    const db = getDb();

    let query = `
      SELECT sub.*, d.name as department_name, d.code as department_code
      FROM subjects sub
      LEFT JOIN departments d ON sub.department_id = d.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (departmentId) {
      query += " AND sub.department_id = ?";
      params.push(parseInt(departmentId, 10));
    }
    if (semester) {
      query += " AND sub.semester = ?";
      params.push(parseInt(semester, 10));
    }
    if (year) {
      query += " AND sub.year = ?";
      params.push(parseInt(year, 10));
    }

    query += " ORDER BY sub.id";

    const subjects = db.prepare(query).all(...params);
    return Response.json({ success: true, data: subjects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch subjects";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const body = await request.json();
    const { name, code, credits, semester, year, department_id } = body;

    if (!name || !code || credits === undefined || !semester || !year || !department_id) {
      return Response.json(
        { success: false, error: "name, code, credits, semester, year, and department_id are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const dept = db.prepare("SELECT id FROM departments WHERE id = ?").get(department_id);
    if (!dept) {
      return Response.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    const result = db
      .prepare(
        `INSERT INTO subjects (name, code, credits, semester, year, department_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name, code, credits, semester, year, department_id);

    const newData = { id: result.lastInsertRowid, name, code, credits, semester, year, department_id };
    auditLog(userId, "CREATE", "subjects", Number(result.lastInsertRowid), null, JSON.stringify(newData));

    return Response.json(
      { success: true, data: newData },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subject";
    if (message.includes("UNIQUE")) {
      return Response.json({ success: false, error: "Subject code already exists" }, { status: 409 });
    }
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
