"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudentForm from "@/components/StudentForm";
import { useToast } from "@/components/Toast";

export default function NewStudentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Student created successfully", "success");
        router.push("/admin/students");
      } else {
        addToast(json.error || "Failed to create student", "error");
      }
    } catch {
      addToast("Failed to create student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-sm text-gray-500 mt-1">Enter the student details below</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <StudentForm onSubmit={handleSubmit} isEditing={false} />
        {submitting && (
          <p className="text-sm text-gray-500 mt-4">Creating student...</p>
        )}
      </div>
    </div>
  );
}