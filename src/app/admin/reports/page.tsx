"use client";

import { useState, useEffect } from "react";

interface StudentsByDepartment {
  department_name: string;
  department_code: string;
  student_count: number;
}

interface RecentGrade {
  id: number;
  student_name: string;
  student_code: string;
  subject_name: string;
  subject_code: string;
  grade: number;
  letter_grade: string;
  semester: string;
  academic_year: string;
}

interface StudentsByStatus {
  status: string;
  count: number;
}

interface StudentsByYear {
  year: number;
  count: number;
}

interface StatsData {
  totalStudents: number;
  totalDepartments: number;
  totalSubjects: number;
  totalGrades: number;
  activeStudents: number;
  studentsByDepartment: StudentsByDepartment[];
  recentGrades: RecentGrade[];
  studentsByStatus: StudentsByStatus[];
  studentsByYear: StudentsByYear[];
}

const statusColorMap: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  graduated: "bg-blue-50 text-blue-700 border-blue-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
};

const letterGradeColorMap = (letter: string): string => {
  if (letter.startsWith("A")) return "bg-green-50 text-green-700";
  if (letter.startsWith("B")) return "bg-blue-50 text-blue-700";
  if (letter.startsWith("C")) return "bg-yellow-50 text-yellow-700";
  if (letter.startsWith("D")) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
};

const yearLabel = (year: number): string => `Year ${year}`;

export default function ReportsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const graduatedCount =
    data?.studentsByStatus?.find((s) => s.status.toLowerCase() === "graduated")
      ?.count ?? 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load report data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Student statistics and analytics overview
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Total Students"
          value={data.totalStudents}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <OverviewCard
          title="Active Students"
          value={data.activeStudents}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <OverviewCard
          title="Graduated Students"
          value={graduatedCount}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <OverviewCard
          title="Total Departments"
          value={data.totalDepartments}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Students by Department">
          {data.studentsByDepartment.length === 0 ? (
            <EmptyMessage />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Department</th>
                      <th className="text-left py-2 font-medium">Code</th>
                      <th className="text-right py-2 font-medium">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentsByDepartment.map((dept) => {
                      const maxCount = Math.max(
                        ...data.studentsByDepartment.map((d) => d.student_count),
                        1
                      );
                      const barWidth = (dept.student_count / maxCount) * 100;
                      return (
                        <tr key={dept.department_code} className="border-t border-gray-100">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 rounded-full bg-blue-400"
                                style={{ width: `${barWidth}%`, minWidth: "4px", maxWidth: "48px" }}
                              />
                              <span className="font-medium text-gray-900">
                                {dept.department_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 text-gray-500">{dept.department_code}</td>
                          <td className="py-2 text-right">
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                              {dept.student_count}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                Total: {data.studentsByDepartment.reduce((sum, d) => sum + d.student_count, 0)} students across{" "}
                {data.studentsByDepartment.length} departments
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Students by Year">
          {data.studentsByYear.length === 0 ? (
            <EmptyMessage />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Year</th>
                      <th className="text-right py-2 font-medium">Students</th>
                      <th className="text-right py-2 font-medium">Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentsByYear.map((y) => {
                      const total = data.studentsByYear.reduce(
                        (sum, item) => sum + item.count,
                        0
                      );
                      const pct = total > 0 ? ((y.count / total) * 100).toFixed(1) : "0.0";
                      const barWidth = total > 0 ? (y.count / total) * 100 : 0;
                      return (
                        <tr key={y.year} className="border-t border-gray-100">
                          <td className="py-2 font-medium text-gray-900">
                            {yearLabel(y.year)}
                          </td>
                          <td className="py-2 text-right">
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">
                              {y.count}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-400 rounded-full"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right">
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Students by Status">
          {data.studentsByStatus.length === 0 ? (
            <EmptyMessage />
          ) : (
            <div className="space-y-3">
              {data.studentsByStatus.map((s) => {
                const total = data.studentsByStatus.reduce(
                  (sum, item) => sum + item.count,
                  0
                );
                const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : "0.0";
                const color =
                  statusColorMap[s.status.toLowerCase()] ??
                  "bg-gray-50 text-gray-700 border-gray-200";
                return (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${color}`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.status.toLowerCase() === "active"
                              ? "bg-green-400"
                              : s.status.toLowerCase() === "graduated"
                              ? "bg-blue-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {s.count}
                      </span>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-gray-100">
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100">
                  {data.studentsByStatus.map((s) => {
                    const total = data.studentsByStatus.reduce(
                      (sum, item) => sum + item.count,
                      0
                    );
                    const width = total > 0 ? (s.count / total) * 100 : 0;
                    const bg =
                      s.status.toLowerCase() === "active"
                        ? "bg-green-400"
                        : s.status.toLowerCase() === "graduated"
                        ? "bg-blue-400"
                        : "bg-red-400";
                    return (
                      <div
                        key={s.status}
                        className={`h-full ${bg}`}
                        style={{ width: `${width}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Recent Grade Entries">
            {data.recentGrades.length === 0 ? (
              <EmptyMessage />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Student</th>
                      <th className="text-left py-2 font-medium">Subject</th>
                      <th className="text-center py-2 font-medium">Grade</th>
                      <th className="text-center py-2 font-medium">Letter</th>
                      <th className="text-left py-2 font-medium">Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentGrades.map((g) => (
                      <tr key={g.id} className="border-t border-gray-100">
                        <td className="py-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {g.student_name}
                            </p>
                            <p className="text-xs text-gray-500">{g.student_code}</p>
                          </div>
                        </td>
                        <td className="py-2">
                          <div>
                            <p className="text-gray-900">{g.subject_name}</p>
                            <p className="text-xs text-gray-500">
                              {g.subject_code}
                            </p>
                          </div>
                        </td>
                        <td className="py-2 text-center font-medium text-gray-900">
                          {g.grade}
                        </td>
                        <td className="py-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${letterGradeColorMap(
                              g.letter_grade
                            )}`}
                          >
                            {g.letter_grade}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500 text-xs">
                          {g.semester} {g.academic_year}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
  icon: React.ReactNode;
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyMessage() {
  return <p className="text-gray-500 text-sm text-center py-4">No data available.</p>;
}
