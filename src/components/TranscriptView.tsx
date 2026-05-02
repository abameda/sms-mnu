"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import type { TranscriptData } from "@/lib/types";

interface TranscriptViewProps {
  transcriptData: TranscriptData;
}

export default function TranscriptView({ transcriptData }: TranscriptViewProps) {
  const { student, semesters, cumulativeGPA, totalCredits } = transcriptData;

  function handlePrint() {
    window.print();
  }

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default ?? html2pdfModule;
    const element = pdfRef.current;
    html2pdf()
      .set({
        margin: 10,
        filename: `transcript_${student.student_id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  }, [student.student_id]);

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-6 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-border rounded-lg hover:bg-secondary-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      <div ref={pdfRef} className="print-area bg-white border border-border rounded-lg overflow-hidden">
        <div className="transcript-print">
          <div className="bg-primary text-primary-foreground px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Image
                src="/mnu-logo.png"
                alt="Minya National University"
                width={64}
                height={64}
                className="rounded-full bg-white object-contain p-1"
                unoptimized
              />
            </div>
            <h1 className="text-xl font-bold">Minya National University</h1>
            <p className="text-sm opacity-90 mt-1">Official Academic Transcript</p>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-4 bg-secondary-50 rounded-lg">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Student Name</span>
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Student ID</span>
                <p className="text-sm font-semibold text-foreground">{student.student_id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Department</span>
                <p className="text-sm font-semibold text-foreground">{student.department_name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Enrollment Year</span>
                <p className="text-sm font-semibold text-foreground">{student.enrollment_year}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Year</span>
                <p className="text-sm font-semibold text-foreground">Year {student.year}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                <p className="text-sm font-semibold text-foreground capitalize">{student.status}</p>
              </div>
            </div>

            {semesters.map((sem, idx) => (
              <div key={idx} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {sem.semester} {sem.academic_year}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      GPA: <span className="font-bold text-foreground">{sem.gpa.toFixed(2)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Credits: <span className="font-bold text-foreground">{sem.totalCredits}</span>
                    </span>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary-100">
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Code</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Subject</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground">Credits</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground">Grade</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground">Letter</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.grades.map((g, gi) => (
                      <tr key={gi} className={gi % 2 === 1 ? "bg-secondary-50" : ""}>
                        <td className="py-2 px-3 text-foreground">{g.subject_code}</td>
                        <td className="py-2 px-3 text-foreground">{g.subject_name}</td>
                        <td className="py-2 px-3 text-center text-foreground">{g.credits}</td>
                        <td className="py-2 px-3 text-center text-foreground">{g.grade}</td>
                        <td className="py-2 px-3 text-center font-semibold text-foreground">{g.letter_grade}</td>
                        <td className="py-2 px-3 text-center text-foreground">
                          {(() => {
                            const map: Record<string, number> = {
                              "A+": 4.0, A: 4.0, "A-": 3.7,
                              "B+": 3.3, B: 3.0, "B-": 2.7,
                              "C+": 2.3, C: 2.0, "C-": 1.7,
                              "D+": 1.3, D: 1.0, "D-": 0.7,
                              F: 0.0,
                            };
                            return map[g.letter_grade] ?? 0.0;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Total Credits Earned</span>
                  <p className="text-lg font-bold text-foreground">{totalCredits}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Cumulative GPA</span>
                  <p className="text-2xl font-bold text-primary">{cumulativeGPA.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
