"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { letterGradeToPoints } from "@/lib/gpa";

interface Grade {
  id: number;
  subject_name: string;
  subject_code: string;
  credits: number;
  grade: number;
  letter_grade: string;
  semester: string;
  academic_year: string;
}

export default function StudentGradesPage() {
  const { data: session, status } = useSession();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    const studentId = (session?.user as { student_id?: number | null } | null)?.student_id;
    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/grades?student_id=${studentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setGrades(json.data);
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  const semesterMap = new Map<string, { grades: Grade[]; gpa: number; totalCredits: number }>();

  for (const g of grades) {
    const key = `${g.semester} - ${g.academic_year}`;
    if (!semesterMap.has(key)) {
      semesterMap.set(key, { grades: [], gpa: 0, totalCredits: 0 });
    }
    semesterMap.get(key)!.grades.push(g);
  }

  let cumulativePoints = 0;
  let cumulativeCredits = 0;

  for (const [, semData] of semesterMap) {
    let semPoints = 0;
    let semCredits = 0;
    for (const g of semData.grades) {
      semPoints += letterGradeToPoints(g.letter_grade) * g.credits;
      semCredits += g.credits;
    }
    semData.gpa = semCredits > 0 ? Math.round((semPoints / semCredits) * 100) / 100 : 0;
    semData.totalCredits = semCredits;
    cumulativePoints += semPoints;
    cumulativeCredits += semCredits;
  }

  const cumulativeGPA = cumulativeCredits > 0 ? Math.round((cumulativePoints / cumulativeCredits) * 100) / 100 : 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading grades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
          <p className="text-sm text-gray-500 mt-1">Your recorded marks and semester GPA</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500">Cumulative GPA</p>
            <p className="text-2xl font-bold text-blue-700">{cumulativeGPA.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500">Credits</p>
            <p className="text-2xl font-bold text-gray-900">{cumulativeCredits}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
          </div>
        </div>
      </div>

      {semesterMap.size === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No grades recorded yet.
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(semesterMap.entries()).map(([semesterLabel, semData]) => (
            <section key={semesterLabel} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{semesterLabel}</h3>
                  <p className="text-xs text-gray-500">{semData.grades.length} subjects</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-gray-700">Credits {semData.totalCredits}</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">GPA {semData.gpa.toFixed(2)}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="text-left px-4 py-2 font-medium">Subject</th>
                        <th className="text-left px-4 py-2 font-medium">Code</th>
                        <th className="text-center px-4 py-2 font-medium">Credits</th>
                        <th className="text-center px-4 py-2 font-medium">Grade</th>
                        <th className="text-center px-4 py-2 font-medium">Letter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semData.grades.map((g) => (
                        <tr key={g.id} className="border-t border-gray-100">
                          <td className="px-4 py-2">{g.subject_name}</td>
                          <td className="px-4 py-2">{g.subject_code}</td>
                          <td className="px-4 py-2 text-center">{g.credits}</td>
                          <td className="px-4 py-2 text-center">{g.grade}%</td>
                          <td className="px-4 py-2 text-center">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700">
                              {g.letter_grade}
                            </span>
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
  );
}
