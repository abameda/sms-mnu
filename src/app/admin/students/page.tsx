"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import StudentForm from "@/components/StudentForm";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Student {
  id: number;
  name: string;
  student_id: string;
  email: string | null;
  phone: string | null;
  department_id: number;
  year: number;
  enrollment_year: number;
  status: string;
  department_name: string;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async (page = 1, searchQuery = "", searchType = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) {
        params.set("search", searchQuery);
        if (searchType) params.set("type", searchType);
      }
      const res = await fetch(`/api/students?${params}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        setPagination(json.pagination);
      }
    } catch {
      addToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Student added successfully", "success");
        setShowAddModal(false);
        fetchStudents(pagination.page);
      } else {
        addToast(json.error || "Failed to add student", "error");
      }
    } catch {
      addToast("Failed to add student", "error");
    }
  };

  const columns = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "department_name", label: "Department" },
    { key: "year", label: "Year" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No students found. Add your first student!
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={students}
              onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
            />
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {students.length} of {pagination.total} students
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchStudents(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchStudents(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student">
        <StudentForm onSubmit={handleAddStudent} isEditing={false} />
      </Modal>
    </div>
  );
}
