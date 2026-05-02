"use client";

import { useState, useEffect, useCallback } from "react";
import GradeForm from "@/components/GradeForm";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  grade: number;
  letter_grade: string;
  semester: string;
  academic_year: string;
  student_name: string;
  student_code: string;
  subject_name: string;
  subject_code: string;
  credits: number;
}

interface Student {
  id: number;
  name: string;
  student_id: string;
}

export default function AdminGradesPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    fetch("/api/students?limit=1000")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStudents(json.data);
      })
      .finally(() => setLoadingStudents(false));
  }, []);

  const fetchGrades = useCallback(async (studentId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grades?student_id=${studentId}`);
      const json = await res.json();
      if (json.success) setGrades(json.data);
    } catch {
      addToast("Failed to fetch grades", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    fetchGrades(studentId);
  };

  const handleAddGrade = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, student_id: selectedStudentId }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Grade added successfully", "success");
        setShowAddModal(false);
        if (selectedStudentId) fetchGrades(selectedStudentId);
      } else {
        addToast(json.error || "Failed to add grade", "error");
      }
    } catch {
      addToast("Failed to add grade", "error");
    }
  };

  const handleEditGrade = async (data: Record<string, unknown>) => {
    if (!editGrade) return;
    try {
      const res = await fetch(`/api/grades/${editGrade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Grade updated successfully", "success");
        setEditGrade(null);
        if (selectedStudentId) fetchGrades(selectedStudentId);
      } else {
        addToast(json.error || "Failed to update grade", "error");
      }
    } catch {
      addToast("Failed to update grade", "error");
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm("Are you sure you want to delete this grade?")) return;
    try {
      const res = await fetch(`/api/grades/${gradeId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        addToast("Grade deleted", "success");
        if (selectedStudentId) fetchGrades(selectedStudentId);
      } else {
        addToast(json.error || "Failed to delete grade", "error");
      }
    } catch {
      addToast("Failed to delete grade", "error");
    }
  };

  const semesterMap = new Map<string, Grade[]>();
  for (const g of grades) {
    const key = `${g.semester} ${g.academic_year}`;
    if (!semesterMap.has(key)) semesterMap.set(key, []);
    semesterMap.get(key)!.push(g);
  }
  const selectedStudent = students.find((student) => student.id === selectedStudentId);
  const recordedCredits = grades.reduce((sum, grade) => sum + Number(grade.credits || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student grades</p>
        </div>
        {selectedStudentId && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Grade
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
        {loadingStudents ? (
          <p className="text-gray-500 text-sm">Loading students...</p>
        ) : (
          <select
            value={selectedStudentId ?? ""}
            onChange={(e) => handleStudentSelect(Number(e.target.value))}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Select a student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.student_id})
              </option>
            ))}
          </select>
        )}
          </div>
          {selectedStudent && (
            <div className="grid grid-cols-2 gap-3 lg:min-w-80">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Recorded Grades</p>
                <p className="text-xl font-semibold text-gray-900">{grades.length}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Credits</p>
                <p className="text-xl font-semibold text-gray-900">{recordedCredits}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStudentId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <p className="text-gray-500 text-center">Loading grades...</p>
          ) : grades.length === 0 ? (
            <p className="text-gray-500 text-center">No grades found for this student.</p>
          ) : (
            <div className="space-y-5">
              {Array.from(semesterMap.entries()).map(([semesterLabel, semGrades]) => (
                <section key={semesterLabel} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">{semesterLabel}</h3>
                    <span className="text-xs text-gray-500">{semGrades.length} grades</span>
                  </div>
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-200">
                          <th className="text-left py-2 font-medium">Subject</th>
                          <th className="text-left py-2 font-medium">Code</th>
                          <th className="text-center py-2 font-medium">Credits</th>
                          <th className="text-center py-2 font-medium">Grade</th>
                          <th className="text-center py-2 font-medium">Letter</th>
                          <th className="text-right py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semGrades.map((g) => (
                          <tr key={g.id} className="border-t border-gray-100">
                            <td className="py-2">{g.subject_name}</td>
                            <td className="py-2">{g.subject_code}</td>
                            <td className="py-2 text-center">{g.credits}</td>
                            <td className="py-2 text-center">{g.grade}</td>
                            <td className="py-2 text-center">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
                                {g.letter_grade}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => setEditGrade(g)}
                                className="text-blue-600 hover:underline text-xs mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteGrade(g.id)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Grade">
        <GradeForm onSubmit={handleAddGrade} isEditing={false} preselectedStudentId={selectedStudentId ?? undefined} />
      </Modal>

      <Modal isOpen={!!editGrade} onClose={() => setEditGrade(null)} title="Edit Grade">
        {editGrade && (
          <GradeForm
            initialData={{
              grade: editGrade.grade,
              semester: editGrade.semester,
              academic_year: editGrade.academic_year,
              subject_id: editGrade.subject_id,
            }}
            onSubmit={handleEditGrade}
            isEditing={true}
          />
        )}
      </Modal>
    </div>
  );
}
