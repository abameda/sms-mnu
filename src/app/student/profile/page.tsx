import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface StudentProfile {
  name: string;
  student_id: string;
  email: string | null;
  phone: string | null;
  department_name: string;
  year: number;
  enrollment_year: number;
  status: string;
}

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const studentId = (session.user as { student_id?: number | null }).student_id;

  let student: StudentProfile | null = null;
  if (studentId) {
    const db = getDb();
    student = db
      .prepare(
        `SELECT s.*, d.name as department_name
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE s.id = ?`
      )
      .get(studentId) as StudentProfile | null;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
        <p className="text-gray-500 mt-2">Unable to load your profile information.</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    graduated: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{student.name}</h2>
              <p className="text-blue-100">Student ID: {student.student_id}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <dl className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{student.email || "N/A"}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium text-gray-900">{student.phone || "N/A"}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Department</dt>
              <dd className="text-sm font-medium text-gray-900">{student.department_name}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Year</dt>
              <dd className="text-sm font-medium text-gray-900">{student.year}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Enrollment Year</dt>
              <dd className="text-sm font-medium text-gray-900">{student.enrollment_year}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-gray-500">Status</dt>
              <dd>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColors[student.status] || "bg-gray-100 text-gray-700"}`}>
                  {student.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
