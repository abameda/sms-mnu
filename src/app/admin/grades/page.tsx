"use client";

import { useState, useEffect, useCallback } from "react";
import GradeForm from "@/components/GradeForm";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Grade {
  id: number; student_id: number; subject_id: number;
  grade: number; letter_grade: string; semester: string;
  academic_year: string; student_name: string; student_code: string;
  subject_name: string; subject_code: string; credits: number;
}
interface Student { id: number; name: string; student_id: string; }

function letterBadgeClass(letter: string): string {
  if (["A+","A","A-"].includes(letter)) return "badge badge-success";
  if (["B+","B","B-"].includes(letter)) return "badge badge-primary";
  if (["C+","C","C-"].includes(letter)) return "badge badge-warning";
  return "badge badge-danger";
}

export default function AdminGradesPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    fetch("/api/students?limit=1000")
      .then(r => r.json()).then(j => { if (j.success) setStudents(j.data); })
      .finally(() => setLoadingStudents(false));
  }, []);

  const fetchGrades = useCallback(async (studentId: number) => {
    setLoading(true);
    try {
      const j = await fetch(`/api/grades?student_id=${studentId}`).then(r => r.json());
      if (j.success) setGrades(j.data);
    } catch { addToast("Failed to fetch grades", "error"); }
    finally { setLoading(false); }
  }, [addToast]);

  const handleStudentSelect = (id: number) => { setSelectedStudentId(id); fetchGrades(id); };

  const handleAddGrade = async (data: Record<string, unknown>) => {
    const j = await fetch("/api/grades", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...data, student_id: selectedStudentId}) }).then(r => r.json());
    if (j.success) { addToast("Grade added", "success"); setShowAddModal(false); if (selectedStudentId) fetchGrades(selectedStudentId); }
    else addToast(j.error || "Failed", "error");
  };

  const handleEditGrade = async (data: Record<string, unknown>) => {
    if (!editGrade) return;
    const j = await fetch(`/api/grades/${editGrade.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) }).then(r => r.json());
    if (j.success) { addToast("Grade updated", "success"); setEditGrade(null); if (selectedStudentId) fetchGrades(selectedStudentId); }
    else addToast(j.error || "Failed", "error");
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm("Delete this grade?")) return;
    const j = await fetch(`/api/grades/${gradeId}`, { method: "DELETE" }).then(r => r.json());
    if (j.success) { addToast("Deleted", "success"); if (selectedStudentId) fetchGrades(selectedStudentId); }
    else addToast(j.error || "Failed", "error");
  };

  const semesterMap = new Map<string, Grade[]>();
  for (const g of grades) {
    const key = `${g.semester} ${g.academic_year}`;
    if (!semesterMap.has(key)) semesterMap.set(key, []);
    semesterMap.get(key)!.push(g);
  }
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const recordedCredits = grades.reduce((sum, g) => sum + Number(g.credits || 0), 0);

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Academic performance</p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Grade Management</h1>
            {selectedStudentId && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary-cta" style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:700, border:"none", cursor:"pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                Add Grade
              </button>
            )}
          </div>
        </div>

        <div className="glass-card section-card" style={{ "--delay":"120ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1.25rem", alignItems:"flex-end" }}>
            <div style={{ flex:1, minWidth:"200px" }}>
              <label className="form-label" htmlFor="student-select">Student</label>
              {loadingStudents ? <div className="skeleton-line" style={{ height:"2.5rem" }} /> : (
                <select id="student-select" value={selectedStudentId ?? ""} onChange={e => handleStudentSelect(Number(e.target.value))} className="form-select">
                  <option value="">Select a student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>)}
                </select>
              )}
            </div>
            {selectedStudent && (
              <div style={{ display:"flex", gap:"0.75rem" }}>
                <div className="stat-mini" style={{ minWidth:"90px" }}>
                  <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Grades</p>
                  <p style={{ fontSize:"2rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.03em", color:"var(--foreground)", marginTop:"0.375rem" }}>{grades.length}</p>
                </div>
                <div className="stat-mini" style={{ minWidth:"90px" }}>
                  <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Credits</p>
                  <p style={{ fontSize:"2rem", fontWeight:800, lineHeight:1, letterSpacing:"-0.03em", color:"var(--foreground)", marginTop:"0.375rem" }}>{recordedCredits}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedStudentId && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
            {loading ? (
              <div className="glass-card" style={{ padding:"3rem 2rem" }}>
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton-line" style={{ width:`${60+i*12}%`, marginBottom:"0.75rem", animationDelay:`${i*80}ms` }} />)}
              </div>
            ) : grades.length === 0 ? (
              <div className="glass-card"><div className="empty-state">
                <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
                <p className="empty-state-title">No grades recorded</p>
                <p className="empty-state-body">Enter the first grade for this student.</p>
                <button onClick={() => setShowAddModal(true)} className="btn-primary-cta" style={{ marginTop:"0.25rem", display:"inline-flex", alignItems:"center", gap:"0.375rem", padding:"0.4375rem 1rem", borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", fontSize:"0.8125rem", fontWeight:700, border:"none", cursor:"pointer" }}>Add Grade</button>
              </div></div>
            ) : (
              Array.from(semesterMap.entries()).map(([label, semGrades], idx) => (
                <section key={label} className="glass-card section-card" style={{ "--delay":`${180+idx*80}ms`, overflow:"hidden", padding:0 } as React.CSSProperties}>
                  <div className="semester-band">
                    <div>
                      <p className="semester-band-label">{label}</p>
                      <p style={{ fontSize:"0.75rem", color:"var(--muted-foreground)", marginTop:"0.125rem" }}>{semGrades.length} subjects</p>
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table className="data-table">
                      <thead><tr>
                        <th>Subject</th><th>Code</th>
                        <th style={{ textAlign:"center" }}>Credits</th>
                        <th style={{ textAlign:"center" }}>Grade</th>
                        <th style={{ textAlign:"center" }}>Letter</th>
                        <th style={{ textAlign:"right" }}>Actions</th>
                      </tr></thead>
                      <tbody>
                        {semGrades.map(g => (
                          <tr key={g.id}>
                            <td>{g.subject_name}</td>
                            <td className="muted">{g.subject_code}</td>
                            <td style={{ textAlign:"center" }}>{g.credits}</td>
                            <td style={{ textAlign:"center", fontWeight:700 }}>{g.grade}</td>
                            <td style={{ textAlign:"center" }}><span className={letterBadgeClass(g.letter_grade)}>{g.letter_grade}</span></td>
                            <td style={{ textAlign:"right" }}>
                              <button onClick={() => setEditGrade(g)} style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--color-primary)", background:"none", border:"none", cursor:"pointer", marginRight:"0.75rem" }}>Edit</button>
                              <button onClick={() => handleDeleteGrade(g.id)} style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--color-danger)", background:"none", border:"none", cursor:"pointer" }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Grade">
        <GradeForm onSubmit={handleAddGrade} isEditing={false} preselectedStudentId={selectedStudentId ?? undefined} />
      </Modal>
      <Modal isOpen={!!editGrade} onClose={() => setEditGrade(null)} title="Edit Grade">
        {editGrade && <GradeForm initialData={{ grade: editGrade.grade, semester: editGrade.semester, academic_year: editGrade.academic_year, subject_id: editGrade.subject_id }} onSubmit={handleEditGrade} isEditing={true} />}
      </Modal>
    </>
  );
}
