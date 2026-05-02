"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TranscriptView from "@/components/TranscriptView";
import type { TranscriptData } from "@/lib/types";

export default function StudentTranscriptPage() {
  const { data: session, status } = useSession();
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    const studentId = (session?.user as { student_id?: number | null } | null)?.student_id;
    if (!studentId) { setLoading(false); setError("Student profile not found. Contact administration."); return; }
    fetch(`/api/transcript/${studentId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setTranscriptData(j.data); else setError(j.error || "Failed to load transcript"); })
      .catch(() => setError("Failed to load transcript. Please try again later."))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (loading) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>
          <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            <div className="skeleton-line" style={{ width:"5rem" }} />
            <div className="skeleton-line" style={{ width:"10rem", height:"2rem" }} />
          </div>
          <div className="glass-card" style={{ padding:"4rem 2rem", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.75rem", color:"var(--muted-foreground)" }}>
              <div className="spinner" />
              <span style={{ fontSize:"0.875rem" }}>Loading transcript...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>
          <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Student portal</p>
            <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Transcript</h1>
          </div>
          <div className="error-surface" style={{ maxWidth:"36rem" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:"0.625rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink:0, marginTop:"0.125rem" }}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!transcriptData) {
    return (
      <>
        <div className="dashboard-glow-bg" aria-hidden="true" />
        <div style={{ position:"relative", zIndex:1 }}>
          <div className="glass-card"><div className="empty-state"><p className="empty-state-title">No transcript available.</p></div></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="dashboard-glow-bg" aria-hidden="true" />
      <div style={{ display:"flex", flexDirection:"column", gap:"2rem", position:"relative", zIndex:1 }}>
        <div className="page-header" style={{ display:"flex", flexDirection:"column", gap:"0.25rem" }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>Student portal</p>
          <h1 style={{ fontSize:"2rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.15, letterSpacing:"-0.03em" }}>Transcript</h1>
        </div>
        <TranscriptView transcriptData={transcriptData} />
      </div>
    </>
  );
}
