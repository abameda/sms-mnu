"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentForm from "@/components/StudentForm";
import { useToast } from "@/components/Toast";
import TranscriptView from "@/components/TranscriptView";

interface StudentData {
  name: string;
  student_id: string;
  email?: string;
  phone?: string;
  department_id: number;
  department_name: string;
  year: number;
  enrollment_year: number;
  status: string;
  gpa?: number;
  grades: Record<string, unknown>[];
  [key: string]: unknown;
}

interface StudentDetailContentProps {
  student: StudentData;
  studentDbId: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default function StudentDetailContent({ student, studentDbId }: StudentDetailContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptData, setTranscriptData] = useState<import("@/lib/types").TranscriptData | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const grades: Record<string, unknown>[] = student.grades || [];

  const semesters = new Map<string, Record<string, unknown>[]>();
  for (const g of grades) {
    const key = `${g.semester} ${g.academic_year}`;
    if (!semesters.has(key)) semesters.set(key, []);
    semesters.get(key)!.push(g);
  }

  const openTranscript = async () => {
    setTranscriptOpen(true);
    if (!transcriptData) {
      setTranscriptLoading(true);
      try {
        const res = await fetch(`/api/transcript/${studentDbId}`);
        const json = await res.json();
        if (json.success) setTranscriptData(json.data);
      } catch {
        // ignore
      } finally {
        setTranscriptLoading(false);
      }
    }
  };

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/students/${studentDbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Student updated successfully", "success");
        setIsEditing(false);
        router.refresh();
      } else {
        addToast(json.error || "Failed to update student", "error");
      }
    } catch {
      addToast("Failed to update student", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${studentDbId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/students");
      } else {
        addToast("Failed to delete student", "error");
      }
    } catch {
      addToast("Failed to delete student", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/students" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Students
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-500 mt-1">ID: {student.student_id}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={openTranscript}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Generate Transcript
            </button>
          )}
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Student</h2>
          <StudentForm
            initialData={{
              name: student.name,
              student_id: student.student_id,
              email: student.email || "",
              phone: student.phone || "",
              department_id: student.department_id,
              year: student.year,
              enrollment_year: student.enrollment_year,
              status: student.status as "active" | "graduated" | "suspended",
            }}
            onSubmit={handleEditSubmit}
            isEditing={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <dl className="space-y-3">
              <InfoRow label="Full Name" value={student.name} />
              <InfoRow label="Student ID" value={student.student_id} />
              <InfoRow label="Email" value={student.email || "N/A"} />
              <InfoRow label="Phone" value={student.phone || "N/A"} />
              <InfoRow label="Department" value={student.department_name} />
              <InfoRow label="Year" value={String(student.year)} />
              <InfoRow label="Enrollment Year" value={String(student.enrollment_year)} />
              <InfoRow label="Status" value={student.status} />
              <InfoRow label="GPA" value={student.gpa !== undefined ? String(student.gpa) : "N/A"} />
            </dl>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Record</h2>
            {semesters.size === 0 ? (
              <p className="text-gray-500 text-sm">No grades recorded yet.</p>
            ) : (
              <div className="space-y-6">
                {Array.from(semesters.entries()).map(([semesterLabel, semGrades]) => (
                  <div key={semesterLabel}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                      {semesterLabel}
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left py-1 font-medium">Subject</th>
                          <th className="text-left py-1 font-medium">Code</th>
                          <th className="text-center py-1 font-medium">Credits</th>
                          <th className="text-center py-1 font-medium">Grade</th>
                          <th className="text-center py-1 font-medium">Letter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semGrades.map((g) => (
                          <tr key={String(g.id)} className="border-t border-gray-100">
                            <td className="py-1.5">{String(g.subject_name)}</td>
                            <td className="py-1.5">{String(g.subject_code)}</td>
                            <td className="py-1.5 text-center">{String(g.credits)}</td>
                            <td className="py-1.5 text-center">{String(g.grade)}</td>
                            <td className="py-1.5 text-center">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
                                {String(g.letter_grade)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {transcriptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setTranscriptOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Transcript — {student.name}</h2>
              <button
                onClick={() => setTranscriptOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {transcriptLoading ? (
                <p className="text-center text-gray-500 py-8">Loading transcript...</p>
              ) : transcriptData ? (
                <TranscriptView transcriptData={transcriptData} />
              ) : (
                <p className="text-center text-gray-500 py-8">Failed to load transcript.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
