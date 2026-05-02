"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import DataTable from "@/components/DataTable";

export default function AdminSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query: string, type?: string) => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const searchType = type === "student_id" ? "id" : "name";
      const j = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`).then(r => r.json());
      if (j.success) setResults(j.data);
    } catch { /* ignore */ }
    finally { setLoading(false); setSearched(true); }
  }, []);

  const columns = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "department_name", label: "Department" },
    { key: "year", label: "Year" },
    { key: "status", label: "Status" },
  ];

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) handleSearch(query, "name");
  }, [handleSearch, searchParams]);

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>

        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Academic records</p>
          <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Search Students</h1>
          <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>Find students by name or student ID</p>
        </div>

        <div className="glass-card section-card" style={{ "--delay":"120ms", padding:"1.5rem 1.75rem" } as React.CSSProperties}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", padding:"0 0.25rem" }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton-line" style={{ width:`${65+i*10}%`, animationDelay:`${i*70}ms` }} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="glass-card">
            <div className="empty-state">
              <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="empty-state-title">No results found</p>
              <p className="empty-state-body">No students match your search. Try a different name or ID.</p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="glass-card section-card" style={{ "--delay":"80ms", overflow:"hidden", padding:0 } as React.CSSProperties}>
            <div style={{ padding:"0.875rem 1.25rem", borderBottom:"1px solid var(--border)" }}>
              <p style={{ fontSize:"0.8125rem", color:"var(--muted-foreground)" }}>
                <span style={{ color:"var(--foreground)", fontWeight:700 }}>{results.length}</span> result{results.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <DataTable
              columns={columns}
              data={results}
              onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
            />
          </div>
        )}

      </div>
    </>
  );
}
