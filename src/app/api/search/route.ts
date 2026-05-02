import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "name";

    if (!q) {
      return Response.json({ success: true, data: [] });
    }

    const db = getDb();

    let query: string;
    let params: string[];

    if (type === "id") {
      query = `
        SELECT s.*, d.name as department_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.student_id LIKE ?
        ORDER BY s.student_id
      `;
      params = [`%${q}%`];
    } else {
      query = `
        SELECT s.*, d.name as department_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE s.name LIKE ?
        ORDER BY s.name
      `;
      params = [`%${q}%`];
    }

    const students = db.prepare(query).all(...params);
    return Response.json({ success: true, data: students });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
