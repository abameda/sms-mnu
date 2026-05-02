import { getDb, seedDatabase } from "@/lib/db";

export async function POST() {
  try {
    await seedDatabase();
    return Response.json({ success: true, data: { message: "Database seeded successfully" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed database";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
