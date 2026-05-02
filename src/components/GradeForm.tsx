"use client";

import { useState, useEffect } from "react";
import { calculateLetterGrade } from "@/lib/gpa";

interface GradeFormData {
  student_id: number;
  subject_id: number;
  grade: number;
  semester: string;
  academic_year: string;
}

interface SubjectOption {
  id: number;
  name: string;
  code: string;
}

interface StudentOption {
  id: number;
  name: string;
  student_id: string;
}

interface GradeFormProps {
  initialData?: Partial<GradeFormData>;
  onSubmit: (data: Record<string, unknown>) => void;
  isEditing?: boolean;
  preselectedStudentId?: number;
}

const semesterOptions = ["Fall", "Spring", "Summer"];

export default function GradeForm({ initialData, onSubmit, isEditing = false, preselectedStudentId }: GradeFormProps) {
  const [form, setForm] = useState<GradeFormData>({
    student_id: preselectedStudentId ?? initialData?.student_id ?? 0,
    subject_id: initialData?.subject_id ?? 0,
    grade: initialData?.grade ?? 0,
    semester: initialData?.semester ?? "Fall",
    academic_year: initialData?.academic_year ?? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof GradeFormData, string>>>({});
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setSubjects(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/students?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setStudents(data.data);
      })
      .catch(() => {});
  }, []);

  const letterGrade = form.grade > 0 ? calculateLetterGrade(form.grade) : "";

  function validate(): boolean {
    const newErrors: Partial<Record<keyof GradeFormData, string>> = {};
    if (!form.student_id) newErrors.student_id = "Student is required";
    if (!form.subject_id) newErrors.subject_id = "Subject is required";
    if (form.grade < 0 || form.grade > 100) newErrors.grade = "Grade must be between 0 and 100";
    if (!form.semester) newErrors.semester = "Semester is required";
    if (!form.academic_year.trim()) newErrors.academic_year = "Academic year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    onSubmit(form as unknown as Record<string, unknown>);
  }

  function handleChange(field: keyof GradeFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const filteredStudents = studentSearch
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
      )
    : students;

  const selectedStudent = students.find((s) => s.id === form.student_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!preselectedStudentId && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Student <span className="text-danger">*</span>
            </label>
            {isEditing && selectedStudent ? (
              <div className="px-3 py-2 border border-input rounded-lg bg-secondary-50 text-sm text-foreground">
                {selectedStudent.name} ({selectedStudent.student_id})
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or student ID..."
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-1"
                />
                <select
                  value={form.student_id}
                  onChange={(e) => handleChange("student_id", Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white ${errors.student_id ? "border-danger" : "border-input"}`}
                >
                  <option value={0}>Select student</option>
                  {filteredStudents.slice(0, 50).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.student_id})
                    </option>
                  ))}
                </select>
              </>
            )}
            {errors.student_id && <p className="mt-1 text-xs text-danger">{errors.student_id}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Subject <span className="text-danger">*</span>
          </label>
          <select
            value={form.subject_id}
            onChange={(e) => handleChange("subject_id", Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white ${errors.subject_id ? "border-danger" : "border-input"}`}
          >
            <option value={0}>Select subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
          {errors.subject_id && <p className="mt-1 text-xs text-danger">{errors.subject_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Grade (0-100) <span className="text-danger">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={form.grade}
              onChange={(e) => handleChange("grade", Number(e.target.value))}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.grade ? "border-danger" : "border-input"}`}
              min={0}
              max={100}
              placeholder="0-100"
            />
            {letterGrade && (
              <div className="flex items-center px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold min-w-[3rem] justify-center">
                {letterGrade}
              </div>
            )}
          </div>
          {errors.grade && <p className="mt-1 text-xs text-danger">{errors.grade}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Semester <span className="text-danger">*</span>
          </label>
          <select
            value={form.semester}
            onChange={(e) => handleChange("semester", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
          >
            {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Academic Year <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.academic_year}
            onChange={(e) => handleChange("academic_year", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.academic_year ? "border-danger" : "border-input"}`}
            placeholder="e.g. 2024-2025"
          />
          {errors.academic_year && <p className="mt-1 text-xs text-danger">{errors.academic_year}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-border rounded-lg hover:bg-secondary-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : isEditing ? "Update Grade" : "Save Grade"}
        </button>
      </div>
    </form>
  );
}
