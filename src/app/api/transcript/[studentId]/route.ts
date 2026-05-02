import { getDb } from "@/lib/db";
import { calculateLetterGrade, letterGradeToPoints, calculateSemesterGPA, calculateCumulativeGPA } from "@/lib/gpa";
import type { TranscriptData, SemesterGPA, GradeWithCredits } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const db = getDb();

    const student = db
      .prepare(
        `SELECT s.*, d.name as department_name
         FROM students s
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE s.id = ?`
      )
      .get(studentId);

    if (!student) {
      return Response.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const grades = db
      .prepare(
        `SELECT g.*, sub.name as subject_name, sub.code as subject_code, sub.credits
         FROM grades g
         LEFT JOIN subjects sub ON g.subject_id = sub.id
         WHERE g.student_id = ?
         ORDER BY g.academic_year, g.semester`
      )
      .all(studentId) as (import("@/lib/types").Grade & {
      subject_name: string;
      subject_code: string;
      credits: number;
    })[];

    const semesterMap = new Map<
      string,
      {
        semester: string;
        academic_year: string;
        grades: (import("@/lib/types").Grade & { subject_name: string; subject_code: string; credits: number })[];
        gradeWithCredits: GradeWithCredits[];
      }
    >();

    for (const g of grades) {
      const key = `${g.semester}-${g.academic_year}`;
      if (!semesterMap.has(key)) {
        semesterMap.set(key, {
          semester: g.semester,
          academic_year: g.academic_year,
          grades: [],
          gradeWithCredits: [],
        });
      }
      const semData = semesterMap.get(key)!;
      semData.grades.push(g);
      semData.gradeWithCredits.push({
        grade: g.grade,
        credits: g.credits,
        letterGrade: g.letter_grade,
      });
    }

    const semesterGPAs: SemesterGPA[] = [];
    const transcriptSemesters: TranscriptData["semesters"] = [];

    for (const [, semData] of semesterMap) {
      const gpa = calculateSemesterGPA(semData.gradeWithCredits);
      const totalCredits = semData.gradeWithCredits.reduce((sum, g) => sum + g.credits, 0);

      semesterGPAs.push({
        semester: semData.semester,
        gpa,
        totalCredits,
      });

      transcriptSemesters.push({
        semester: semData.semester,
        academic_year: semData.academic_year,
        grades: semData.grades,
        gpa,
        totalCredits,
      });
    }

    const cumulativeGPA = calculateCumulativeGPA(semesterGPAs);
    const totalCredits = semesterGPAs.reduce((sum, s) => sum + s.totalCredits, 0);

    const transcriptData: TranscriptData = {
      student: student as TranscriptData["student"],
      semesters: transcriptSemesters,
      cumulativeGPA,
      totalCredits,
    };

    return Response.json({ success: true, data: transcriptData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate transcript";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
