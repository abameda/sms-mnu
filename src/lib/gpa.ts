import type { GradeWithCredits, SemesterGPA } from "./types";

export function calculateLetterGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

export function letterGradeToPoints(letterGrade: string): number {
  const map: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  };
  return map[letterGrade] ?? 0.0;
}

export function calculateSemesterGPA(grades: GradeWithCredits[]): number {
  if (grades.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const g of grades) {
    const points = letterGradeToPoints(g.letterGrade);
    totalPoints += points * g.credits;
    totalCredits += g.credits;
  }

  return totalCredits === 0 ? 0.0 : Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function calculateCumulativeGPA(allSemesters: SemesterGPA[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const sem of allSemesters) {
    totalPoints += sem.gpa * sem.totalCredits;
    totalCredits += sem.totalCredits;
  }

  return totalCredits === 0 ? 0.0 : Math.round((totalPoints / totalCredits) * 100) / 100;
}
