import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { calculateLetterGrade } from "./gpa";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "sms.db");
  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createTables(db);
  seedDatabaseSync(db);
  ensureUniversityData(db);
  return db;
}

function createTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'student_affairs', 'student')),
      student_id INTEGER,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      credits REAL NOT NULL,
      semester INTEGER NOT NULL,
      year INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      student_id TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      department_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      enrollment_year INTEGER NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'graduated', 'suspended'))
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      grade REAL NOT NULL CHECK(grade >= 0 AND grade <= 100),
      letter_grade TEXT,
      semester TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      UNIQUE(student_id, subject_id, semester, academic_year)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export function auditLog(userId: number, action: string, tableName: string, recordId: number | null, oldValue: string | null, newValue: string | null): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO audit_log (user_id, action, table_name, record_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, action, tableName, recordId, oldValue, newValue);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function seedDatabaseSync(database: Database.Database): void {
  const adminExists = database.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  if (adminExists) return;

  const hashedPassword = bcrypt.hashSync("admin123", 12);
  const studentPassword = bcrypt.hashSync("student", 12);
  const affairsPassword = bcrypt.hashSync("affairs123", 12);

  const insertDept = database.prepare("INSERT INTO departments (name, code) VALUES (?, ?)");
  const insertSubject = database.prepare("INSERT INTO subjects (name, code, credits, semester, year, department_id) VALUES (?, ?, ?, ?, ?, ?)");
  const insertStudent = database.prepare("INSERT INTO students (name, student_id, email, phone, department_id, year, enrollment_year, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertUser = database.prepare("INSERT INTO users (username, password, role, student_id) VALUES (?, ?, ?, ?)");
  const insertGrade = database.prepare("INSERT INTO grades (student_id, subject_id, grade, letter_grade, semester, academic_year) VALUES (?, ?, ?, ?, ?, ?)");

  const transaction = database.transaction(() => {
    const deptCS = insertDept.run("Computer and Artificial Intelligence", "CAI");
    const deptEE = insertDept.run("Electrical Engineering", "EE");
    const deptME = insertDept.run("Mechanical Engineering", "ME");
    const deptBUS = insertDept.run("Business Administration", "BUS");

    const cs101 = insertSubject.run("Introduction to Programming", "CS101", 3, 1, 1, deptCS.lastInsertRowid);
    const cs201 = insertSubject.run("Data Structures", "CS201", 3, 1, 2, deptCS.lastInsertRowid);
    const cs301 = insertSubject.run("Algorithms", "CS301", 3, 2, 3, deptCS.lastInsertRowid);
    const cs302 = insertSubject.run("Database Systems", "CS302", 3, 1, 3, deptCS.lastInsertRowid);
    const cs303 = insertSubject.run("Operating Systems", "CS303", 3, 2, 3, deptCS.lastInsertRowid);

    insertSubject.run("Circuit Analysis", "EE101", 3, 1, 1, deptEE.lastInsertRowid);
    insertSubject.run("Digital Logic", "EE201", 3, 2, 2, deptEE.lastInsertRowid);
    insertSubject.run("Signals and Systems", "EE301", 3, 1, 3, deptEE.lastInsertRowid);

    insertSubject.run("Thermodynamics", "ME101", 3, 1, 1, deptME.lastInsertRowid);
    insertSubject.run("Fluid Mechanics", "ME201", 3, 2, 2, deptME.lastInsertRowid);

    insertSubject.run("Principles of Management", "BUS101", 3, 1, 1, deptBUS.lastInsertRowid);
    insertSubject.run("Financial Accounting", "BUS201", 3, 2, 2, deptBUS.lastInsertRowid);

    const ahmed = insertStudent.run("Ahmed Hassan", "20210001", "ahmed@university.edu", "0501234567", deptCS.lastInsertRowid, 3, 2021, "active");
    const fatima = insertStudent.run("Fatima Ali", "20210002", "fatima@university.edu", "0507654321", deptCS.lastInsertRowid, 3, 2021, "active");
    const omar = insertStudent.run("Omar Khalid", "20220001", "omar@university.edu", "0509876543", deptEE.lastInsertRowid, 2, 2022, "active");
    const sara = insertStudent.run("Sara Mohamed", "20220002", "sara@university.edu", "0502345678", deptME.lastInsertRowid, 2, 2022, "active");
    const yusuf = insertStudent.run("Yusuf Ibrahim", "20230001", "yusuf@university.edu", "0503456789", deptBUS.lastInsertRowid, 1, 2023, "active");
    const noor = insertStudent.run("Noor Abdullah", "20230002", "noor@university.edu", "0504567890", deptCS.lastInsertRowid, 1, 2023, "active");

    insertUser.run("admin", hashedPassword, "admin", null);
    insertUser.run("affairs", affairsPassword, "student_affairs", null);

    insertUser.run("20210001", studentPassword, "student", ahmed.lastInsertRowid);
    insertUser.run("20210002", studentPassword, "student", fatima.lastInsertRowid);
    insertUser.run("20220001", studentPassword, "student", omar.lastInsertRowid);
    insertUser.run("20220002", studentPassword, "student", sara.lastInsertRowid);
    insertUser.run("20230001", studentPassword, "student", yusuf.lastInsertRowid);
    insertUser.run("20230002", studentPassword, "student", noor.lastInsertRowid);

    insertGrade.run(ahmed.lastInsertRowid, cs101.lastInsertRowid, 92, "A-", "Fall", "2021-2022");
    insertGrade.run(ahmed.lastInsertRowid, cs201.lastInsertRowid, 88, "B+", "Fall", "2022-2023");
    insertGrade.run(ahmed.lastInsertRowid, cs301.lastInsertRowid, 85, "B", "Spring", "2023-2024");
    insertGrade.run(ahmed.lastInsertRowid, cs302.lastInsertRowid, 91, "A-", "Fall", "2023-2024");

    insertGrade.run(fatima.lastInsertRowid, cs101.lastInsertRowid, 95, "A", "Fall", "2021-2022");
    insertGrade.run(fatima.lastInsertRowid, cs201.lastInsertRowid, 78, "C+", "Fall", "2022-2023");
    insertGrade.run(fatima.lastInsertRowid, cs303.lastInsertRowid, 82, "B-", "Spring", "2023-2024");
    insertGrade.run(fatima.lastInsertRowid, cs302.lastInsertRowid, 89, "B+", "Fall", "2023-2024");
  });

  transaction();
}

function ensureUniversityData(database: Database.Database): void {
  const studentPassword = bcrypt.hashSync("student", 12);
  const requestedStudents = [
    { name: "عبدالحميد الشوربجي", code: "4011211", year: 3 },
    { name: "عبدالرحمن دياب خلف", code: "4011212", year: 3 },
    { name: "عبدالرحمن احمد عيد", code: "4011213", year: 3 },
    { name: "سامح نصر الله حنا", code: "4011214", year: 3 },
    { name: "طه احمد محمود", code: "4011215", year: 3 },
    { name: "زياد ايمن محمد", code: "4011216", year: 3 },
    { name: "سعيد عام سعيد", code: "4011217", year: 3 },
    { name: "رأفت اسامه فضيل", code: "4011218", year: 3 },
  ];

  const transaction = database.transaction(() => {
    const existingCai = database.prepare("SELECT id FROM departments WHERE code = ?").get("CAI") as { id: number } | undefined;
    const caiDepartmentId = existingCai?.id ?? Number(database.prepare("INSERT INTO departments (name, code) VALUES (?, ?)").run("Computer and Artificial Intelligence", "CAI").lastInsertRowid);

    database.prepare("UPDATE departments SET name = ?, code = ? WHERE id = ?").run("Computer and Artificial Intelligence", "CAI", caiDepartmentId);
    database.prepare("UPDATE students SET department_id = ?").run(caiDepartmentId);
    database.prepare("DELETE FROM subjects").run();
    database.prepare("DELETE FROM departments WHERE id <> ?").run(caiDepartmentId);

    const subjects = [
      ["Artificial intelligence", "AI101", 3, 1, 2],
      ["System Analysis and design", "SAD201", 3, 1, 2],
      ["Database Management", "DBM301", 3, 2, 3],
      ["Data Structure", "DS201", 3, 2, 2],
      ["Server Lab", "SL301", 2, 2, 3],
    ] as const;

    const insertSubject = database.prepare(
      "INSERT INTO subjects (name, code, credits, semester, year, department_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const subjectIds = subjects.map(([name, code, credits, semester, year]) =>
      Number(insertSubject.run(name, code, credits, semester, year, caiDepartmentId).lastInsertRowid)
    );

    const codes = requestedStudents.map((student) => student.code);
    database.prepare(`DELETE FROM grades WHERE student_id NOT IN (SELECT id FROM students WHERE student_id IN (${codes.map(() => "?").join(",")}))`).run(...codes);
    database.prepare(`DELETE FROM users WHERE role = 'student' AND username NOT IN (${codes.map(() => "?").join(",")})`).run(...codes);
    database.prepare(`DELETE FROM students WHERE student_id NOT IN (${codes.map(() => "?").join(",")})`).run(...codes);

    const insertStudent = database.prepare(
      `INSERT INTO students (name, student_id, email, phone, department_id, year, enrollment_year, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStudent = database.prepare(
      `UPDATE students
       SET name = ?, email = ?, phone = ?, department_id = ?, year = ?, enrollment_year = ?, status = ?
       WHERE student_id = ?`
    );

    for (const student of requestedStudents) {
      const existing = database.prepare("SELECT id FROM students WHERE student_id = ?").get(student.code) as { id: number } | undefined;
      if (existing) {
        updateStudent.run(student.name, `${student.code}@mnu.edu.eg`, null, caiDepartmentId, student.year, 2024, "active", student.code);
      } else {
        insertStudent.run(student.name, student.code, `${student.code}@mnu.edu.eg`, null, caiDepartmentId, student.year, 2024, "active");
      }
    }

    const students = database.prepare("SELECT id, student_id FROM students ORDER BY student_id").all() as { id: number; student_id: string }[];
    const upsertUser = database.prepare(
      `INSERT INTO users (username, password, role, student_id)
       VALUES (?, ?, 'student', ?)
       ON CONFLICT(username) DO UPDATE SET password = excluded.password, role = 'student', student_id = excluded.student_id`
    );
    for (const student of students) {
      upsertUser.run(student.student_id, studentPassword, student.id);
    }

    database.prepare("DELETE FROM grades").run();
    const insertGrade = database.prepare(
      "INSERT INTO grades (student_id, subject_id, grade, letter_grade, semester, academic_year) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const gradeRows = [
      [92, "Fall", "2024-2025"],
      [86, "Fall", "2024-2025"],
      [89, "Spring", "2024-2025"],
      [94, "Spring", "2024-2025"],
      [90, "Spring", "2024-2025"],
    ] as const;
    for (const [index, student] of students.entries()) {
      gradeRows.forEach(([grade, semester, academicYear], subjectIndex) => {
        const adjustedGrade = Math.max(65, Number(grade) - (index % 4) * 3);
        insertGrade.run(student.id, subjectIds[subjectIndex], adjustedGrade, calculateLetterGrade(adjustedGrade), semester, academicYear);
      });
    }
  });

  transaction();
}

export async function seedDatabase(): Promise<void> {
  const database = getDb();

  const adminExists = database.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  if (adminExists) return;

  const hashedPassword = await hashPassword("admin123");
  const studentPassword = await hashPassword("student");
  const affairsPassword = await hashPassword("affairs123");

  const insertDept = database.prepare("INSERT INTO departments (name, code) VALUES (?, ?)");
  const insertSubject = database.prepare("INSERT INTO subjects (name, code, credits, semester, year, department_id) VALUES (?, ?, ?, ?, ?, ?)");
  const insertStudent = database.prepare("INSERT INTO students (name, student_id, email, phone, department_id, year, enrollment_year, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertUser = database.prepare("INSERT INTO users (username, password, role, student_id) VALUES (?, ?, ?, ?)");
  const insertGrade = database.prepare("INSERT INTO grades (student_id, subject_id, grade, letter_grade, semester, academic_year) VALUES (?, ?, ?, ?, ?, ?)");

  const transaction = database.transaction(() => {
    const deptCS = insertDept.run("Computer and Artificial Intelligence", "CAI");
    const deptEE = insertDept.run("Electrical Engineering", "EE");
    const deptME = insertDept.run("Mechanical Engineering", "ME");
    const deptBUS = insertDept.run("Business Administration", "BUS");

    const cs101 = insertSubject.run("Introduction to Programming", "CS101", 3, 1, 1, deptCS.lastInsertRowid);
    const cs201 = insertSubject.run("Data Structures", "CS201", 3, 1, 2, deptCS.lastInsertRowid);
    const cs301 = insertSubject.run("Algorithms", "CS301", 3, 2, 3, deptCS.lastInsertRowid);
    const cs302 = insertSubject.run("Database Systems", "CS302", 3, 1, 3, deptCS.lastInsertRowid);
    const cs303 = insertSubject.run("Operating Systems", "CS303", 3, 2, 3, deptCS.lastInsertRowid);

    insertSubject.run("Circuit Analysis", "EE101", 3, 1, 1, deptEE.lastInsertRowid);
    insertSubject.run("Digital Logic", "EE201", 3, 2, 2, deptEE.lastInsertRowid);
    insertSubject.run("Signals and Systems", "EE301", 3, 1, 3, deptEE.lastInsertRowid);

    insertSubject.run("Thermodynamics", "ME101", 3, 1, 1, deptME.lastInsertRowid);
    insertSubject.run("Fluid Mechanics", "ME201", 3, 2, 2, deptME.lastInsertRowid);

    insertSubject.run("Principles of Management", "BUS101", 3, 1, 1, deptBUS.lastInsertRowid);
    insertSubject.run("Financial Accounting", "BUS201", 3, 2, 2, deptBUS.lastInsertRowid);

    const ahmed = insertStudent.run("Ahmed Hassan", "20210001", "ahmed@university.edu", "0501234567", deptCS.lastInsertRowid, 3, 2021, "active");
    const fatima = insertStudent.run("Fatima Ali", "20210002", "fatima@university.edu", "0507654321", deptCS.lastInsertRowid, 3, 2021, "active");
    const omar = insertStudent.run("Omar Khalid", "20220001", "omar@university.edu", "0509876543", deptEE.lastInsertRowid, 2, 2022, "active");
    const sara = insertStudent.run("Sara Mohamed", "20220002", "sara@university.edu", "0502345678", deptME.lastInsertRowid, 2, 2022, "active");
    const yusuf = insertStudent.run("Yusuf Ibrahim", "20230001", "yusuf@university.edu", "0503456789", deptBUS.lastInsertRowid, 1, 2023, "active");
    const noor = insertStudent.run("Noor Abdullah", "20230002", "noor@university.edu", "0504567890", deptCS.lastInsertRowid, 1, 2023, "active");

    insertUser.run("admin", hashedPassword, "admin", null);
    insertUser.run("affairs", affairsPassword, "student_affairs", null);

    insertUser.run("20210001", studentPassword, "student", ahmed.lastInsertRowid);
    insertUser.run("20210002", studentPassword, "student", fatima.lastInsertRowid);
    insertUser.run("20220001", studentPassword, "student", omar.lastInsertRowid);
    insertUser.run("20220002", studentPassword, "student", sara.lastInsertRowid);
    insertUser.run("20230001", studentPassword, "student", yusuf.lastInsertRowid);
    insertUser.run("20230002", studentPassword, "student", noor.lastInsertRowid);

    insertGrade.run(ahmed.lastInsertRowid, cs101.lastInsertRowid, 92, "A-", "Fall", "2021-2022");
    insertGrade.run(ahmed.lastInsertRowid, cs201.lastInsertRowid, 88, "B+", "Fall", "2022-2023");
    insertGrade.run(ahmed.lastInsertRowid, cs301.lastInsertRowid, 85, "B", "Spring", "2023-2024");
    insertGrade.run(ahmed.lastInsertRowid, cs302.lastInsertRowid, 91, "A-", "Fall", "2023-2024");

    insertGrade.run(fatima.lastInsertRowid, cs101.lastInsertRowid, 95, "A", "Fall", "2021-2022");
    insertGrade.run(fatima.lastInsertRowid, cs201.lastInsertRowid, 78, "C+", "Fall", "2022-2023");
    insertGrade.run(fatima.lastInsertRowid, cs303.lastInsertRowid, 82, "B-", "Spring", "2023-2024");
    insertGrade.run(fatima.lastInsertRowid, cs302.lastInsertRowid, 89, "B+", "Fall", "2023-2024");
  });

  transaction();
}
