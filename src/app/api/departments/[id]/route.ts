import { getServerSession } from "next-auth";
import { getDb, auditLog } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const department = db.prepare("SELECT * FROM departments WHERE id = ?").get(id);

    if (!department) {
      return Response.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: department });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch department";
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

    const existing = db.prepare("SELECT * FROM departments WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, code } = body;

    db.prepare("UPDATE departments SET name = COALESCE(?, name), code = COALESCE(?, code) WHERE id = ?")
      .run(name || null, code || null, id);

    const updated = db.prepare("SELECT * FROM departments WHERE id = ?").get(id);
    auditLog(userId, "UPDATE", "departments", parseInt(id, 10), JSON.stringify(existing), JSON.stringify(updated));
    return Response.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update department";
    if (message.includes("UNIQUE")) {
      return Response.json({ success: false, error: "Department code already exists" }, { status: 409 });
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

    const existing = db.prepare("SELECT * FROM departments WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ success: false, error: "Department not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM departments WHERE id = ?").run(id);
    auditLog(userId, "DELETE", "departments", parseInt(id, 10), JSON.stringify(existing), null);
    return Response.json({ success: true, data: { message: "Department deleted" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete department";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
