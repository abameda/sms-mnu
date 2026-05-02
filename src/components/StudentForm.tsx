"use client";

import { useState, useEffect } from "react";
import type { Department } from "@/lib/types";

interface StudentFormData {
  name: string;
  student_id: string;
  email: string;
  phone: string;
  department_id: number;
  year: number;
  enrollment_year: number;
  status: "active" | "graduated" | "suspended";
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: Record<string, unknown>) => void;
  isEditing?: boolean;
}

const emptyForm: StudentFormData = {
  name: "",
  student_id: "",
  email: "",
  phone: "",
  department_id: 0,
  year: 1,
  enrollment_year: new Date().getFullYear(),
  status: "active",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StudentForm({ initialData, onSubmit, isEditing = false }: StudentFormProps) {
  const [form, setForm] = useState<StudentFormData>({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setDepartments(data.data);
      })
      .catch(() => {});
  }, []);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.student_id.trim()) newErrors.student_id = "Student ID is required";
    if (form.email && !emailRegex.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.department_id) newErrors.department_id = "Department is required";
    if (form.year < 1 || form.year > 4) newErrors.year = "Year must be between 1 and 4";
    if (form.enrollment_year < 2000 || form.enrollment_year > new Date().getFullYear() + 1) {
      newErrors.enrollment_year = "Invalid enrollment year";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    onSubmit(form as unknown as Record<string, unknown>);
  }

  function handleChange(field: keyof StudentFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.name ? "border-danger" : "border-input"}`}
            placeholder="Enter full name"
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Student ID <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.student_id}
            onChange={(e) => handleChange("student_id", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.student_id ? "border-danger" : "border-input"}`}
            placeholder="e.g. 2024001"
            disabled={isEditing}
          />
          {errors.student_id && <p className="mt-1 text-xs text-danger">{errors.student_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? "border-danger" : "border-input"}`}
            placeholder="student@mnu.edu"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="+218 XX XXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Department <span className="text-danger">*</span>
          </label>
          <select
            value={form.department_id}
            onChange={(e) => handleChange("department_id", Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white ${errors.department_id ? "border-danger" : "border-input"}`}
          >
            <option value={0}>Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && <p className="mt-1 text-xs text-danger">{errors.department_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Year <span className="text-danger">*</span>
          </label>
          <select
            value={form.year}
            onChange={(e) => handleChange("year", Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
          >
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Enrollment Year <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            value={form.enrollment_year}
            onChange={(e) => handleChange("enrollment_year", Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.enrollment_year ? "border-danger" : "border-input"}`}
            min={2000}
            max={currentYear + 1}
          />
          {errors.enrollment_year && <p className="mt-1 text-xs text-danger">{errors.enrollment_year}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
          >
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
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
          {loading ? "Saving..." : isEditing ? "Update Student" : "Create Student"}
        </button>
      </div>
    </form>
  );
}