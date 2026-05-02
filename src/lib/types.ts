export interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "student_affairs" | "student";
  student_id: number | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
  semester: number;
  year: number;
  department_id: number;
}

export interface Student {
  id: number;
  name: string;
  student_id: string;
  email: string | null;
  phone: string | null;
  department_id: number;
  year: number;
  enrollment_year: number;
  status: "active" | "graduated" | "suspended";
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  grade: number;
  letter_grade: string;
  semester: string;
  academic_year: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  table_name: string;
  record_id: number | null;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export interface GradeWithCredits {
  grade: number;
  credits: number;
  letterGrade: string;
}

export interface SemesterGPA {
  semester: string;
  gpa: number;
  totalCredits: number;
}

export interface TranscriptData {
  student: Student & { department_name: string };
  semesters: {
    semester: string;
    academic_year: string;
    grades: (Grade & { subject_name: string; subject_code: string; credits: number })[];
    gpa: number;
    totalCredits: number;
  }[];
  cumulativeGPA: number;
  totalCredits: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
