import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const departments = db.prepare("SELECT * FROM departments ORDER BY id").all();
    return Response.json({ success: true, data: departments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch departments";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? Number((session.user as { id?: string }).id) : 0;
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return Response.json({ success: false, error: "Name and code are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare("INSERT INTO departments (name, code) VALUES (?, ?)").run(name, code);

    const newData = { id: result.lastInsertRowid, name, code };
    auditLog(userId, "CREATE", "departments", Number(result.lastInsertRowid), null, JSON.stringify(newData));

    return Response.json(
      { success: true, data: newData },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create department";
    if (message.includes("UNIQUE")) {
      return Response.json({ success: false, error: "Department code already exists" }, { status: 409 });
    }
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
