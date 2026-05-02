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
    if (!studentId) {
      setLoading(false);
      setError("Student profile not found. Please contact administration.");
      return;
    }

    fetch(`/api/transcript/${studentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setTranscriptData(json.data);
        } else {
          setError(json.error || "Failed to load transcript");
        }
      })
      .catch(() => {
        setError("Failed to load transcript. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading transcript...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-red-800 mb-1">Error</h2>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!transcriptData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transcript data available.</p>
      </div>
    );
  }

  return <TranscriptView transcriptData={transcriptData} />;
}
