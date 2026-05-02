"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface Subject {
  id: number; name: string; code: string; credits: number;
  semester: number; year: number; department_id: number;
  department_name: string; department_code: string;
}
interface Department { id: number; name: string; code: string; }

export default function AdminSubjectsPage() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ department_id: "", semester: "", year: "" });
  const [form, setForm] = useState({ name: "", code: "", credits: 3, semester: 1, year: 1, department_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department_id) params.set("department_id", filters.department_id);
      if (filters.semester) params.set("semester", filters.semester);
      if (filters.year) params.set("year", filters.year);
      const j = await fetch(`/api/subjects?${params}`).then(r => r.json());
      if (j.success) setSubjects(j.data);
    } catch { addToast("Failed to fetch subjects", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(j => { if (j.success) setDepartments(j.data); });
  }, []);

  useEffect(() => { fetchSubjects(); }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const j = await fetch("/api/subjects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, department_id: Number(form.department_id), credits: Number(form.credits), semester: Number(form.semester), year: Number(form.year) }),
      }).then(r => r.json());
      if (j.success) {
        addToast("Subject created", "success");
        setShowModal(false);
        setForm({ name: "", code: "", credits: 3, semester: 1, year: 1, department_id: "" });
        fetchSubjects();
      } else addToast(j.error || "Failed", "error");
    } catch { addToast("Failed to create subject", "error"); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: "code", label: "Code" }, { key: "name", label: "Name" },
    { key: "credits", label: "Credits" }, { key: "department_name", label: "Department" },
    { key: "semester", label: "Semester" }, { key: "year", label: "Year" },
  ];

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Curriculum</p>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Subjects</h1>
            <button onClick={() => setShowModal(true)} className="btn-primary-cta" style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:700, border:"none", cursor:"pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              Add Subject
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card section-card" style={{ "--delay":"80ms", padding:"1.25rem 1.5rem" } as React.CSSProperties}>
          <div className="filter-bar">
            <div>
              <label className="form-label" htmlFor="filter-dept">Department</label>
              <select id="filter-dept" value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})} className="form-select" style={{ width:"auto", minWidth:"160px" }}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="filter-sem">Semester</label>
              <select id="filter-sem" value={filters.semester} onChange={e => setFilters({...filters, semester: e.target.value})} className="form-select" style={{ width:"auto", minWidth:"130px" }}>
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="filter-year">Year</label>
              <select id="filter-year" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="form-select" style={{ width:"auto", minWidth:"110px" }}>
                <option value="">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card section-card" style={{ "--delay":"160ms", overflow:"hidden", padding:0 } as React.CSSProperties}>
          {loading ? (
            <div style={{ padding:"3rem 2rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton-line" style={{ width:`${60+i*7}%`, animationDelay:`${i*70}ms` }} />)}
            </div>
          ) : subjects.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <p className="empty-state-title">No subjects found</p>
              <p className="empty-state-body">Create a subject or adjust your filters.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={subjects} onRowClick={() => {}} />
          )}
        </div>

      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Subject">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          <div>
            <label className="form-label" htmlFor="sub-name">Name</label>
            <input id="sub-name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="form-input" placeholder="e.g. Data Structures" />
          </div>
          <div>
            <label className="form-label" htmlFor="sub-code">Code</label>
            <input id="sub-code" type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required className="form-input" placeholder="e.g. CS201" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div>
              <label className="form-label" htmlFor="sub-credits">Credits</label>
              <input id="sub-credits" type="number" value={form.credits} onChange={e => setForm({...form, credits: Number(e.target.value)})} min={1} max={6} required className="form-input" />
            </div>
            <div>
              <label className="form-label" htmlFor="sub-dept">Department</label>
              <select id="sub-dept" value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})} required className="form-select">
                <option value="">Select</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <div>
              <label className="form-label" htmlFor="sub-sem">Semester</label>
              <select id="sub-sem" value={form.semester} onChange={e => setForm({...form, semester: Number(e.target.value)})} className="form-select">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="sub-year">Year</label>
              <select id="sub-year" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className="form-select">
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.5rem", paddingTop:"0.5rem" }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost-cta" style={{ padding:"0.5rem 1rem", fontSize:"0.8125rem", fontWeight:600, border:"1px solid var(--border)", borderRadius:"0.5rem", background:"var(--card)", color:"var(--foreground)", cursor:"pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary-cta" style={{ padding:"0.5rem 1.125rem", fontSize:"0.8125rem", fontWeight:700, borderRadius:"0.5rem", background:"var(--color-primary)", color:"var(--color-primary-foreground)", border:"none", cursor:"pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
