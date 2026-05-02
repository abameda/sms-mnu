"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { TranscriptData } from "@/lib/types";

interface TranscriptViewProps {
  transcriptData: TranscriptData;
}

const GPA_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

function letterBadgeClass(letter: string): string {
  if (["A+", "A", "A-"].includes(letter)) return "badge badge-success";
  if (["B+", "B", "B-"].includes(letter)) return "badge badge-primary";
  if (["C+", "C", "C-"].includes(letter)) return "badge badge-warning";
  return "badge badge-danger";
}

function statusBadgeClass(status: string): string {
  if (status === "active") return "badge-status-active";
  if (status === "graduated") return "badge-status-graduated";
  if (status === "suspended") return "badge-status-suspended";
  return "badge badge-primary";
}

export default function TranscriptView({ transcriptData }: TranscriptViewProps) {
  const { student, semesters, cumulativeGPA, totalCredits } = transcriptData;
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePrint = () => window.print();

  const handleExportPDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      // ── Build clean, self-contained HTML (no CSS vars, no dark theme) ──
      const tealAccent = "#0d7c6b";
      const logoSrc = `${window.location.origin}/mnu-logo.png`;

      const semestersHtml = semesters.length === 0
        ? `<p style="color:#666;text-align:center;padding:20pt">No grades recorded yet.</p>`
        : semesters.map(sem => {
            const TD = "padding:6pt 10pt;border-bottom:1pt solid #eef0f4;color:#111";
            const badgeStyle = (l: string) =>
              ["A+","A","A-"].includes(l) ? "background:#dcfce7;color:#15803d"
              : ["B+","B","B-"].includes(l) ? "background:#dbeafe;color:#1d4ed8"
              : ["C+","C","C-"].includes(l) ? "background:#fef9c3;color:#a16207"
              : "background:#fee2e2;color:#b91c1c";
            const rows = sem.grades.map(g => `
              <tr>
                <td style="${TD};color:#666;font-size:8.5pt">${g.subject_code}</td>
                <td style="${TD}">${g.subject_name}</td>
                <td style="${TD};text-align:center">${g.credits}</td>
                <td style="${TD};text-align:center;font-weight:700">${g.grade}</td>
                <td style="${TD};text-align:center">
                  <div style="display:flex;justify-content:center;align-items:center">
                    <span style="display:inline-block;padding:2pt 7pt;border-radius:999pt;font-size:7pt;font-weight:700;${badgeStyle(g.letter_grade)}">${g.letter_grade}</span>
                  </div>
                </td>
                <td style="${TD};text-align:center;font-weight:700">${GPA_POINTS[g.letter_grade] !== undefined ? GPA_POINTS[g.letter_grade].toFixed(1) : "—"}</td>
              </tr>`).join("");
            return `
            <div class="semester">
              <div class="semester-header">
                <div>
                  <div class="name">${sem.semester} — ${sem.academic_year}</div>
                  <div class="meta">${sem.grades.length} subject${sem.grades.length !== 1 ? "s" : ""}</div>
                </div>
                <div class="stats">
                  <div><div class="stat-label">Credits</div><div class="stat-val">${sem.totalCredits}</div></div>
                  <div><div class="stat-label">GPA</div><div class="stat-val">${sem.gpa.toFixed(2)}</div></div>
                </div>
              </div>
              <table>
                <thead><tr>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:left">Code</th>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:left">Subject</th>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:center">Credits</th>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:center">Grade</th>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:center">Letter</th>
                  <th style="padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:center">Points</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
          }).join("");

      const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#111;font-size:11pt;line-height:1.5;width:794px;margin:0;padding:0}
.header-band{background:${tealAccent};color:#fff;padding:14pt 18pt;display:flex;align-items:center;gap:12pt;border-radius:6pt 6pt 0 0}
.header-band img{width:44pt;height:44pt;object-fit:contain;border-radius:50%;background:#fff;padding:3pt}
.header-band h1{font-size:14pt;font-weight:800;margin:0}
.header-band p{font-size:8pt;font-weight:600;opacity:.75;letter-spacing:.07em;text-transform:uppercase;margin-top:2pt}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1pt solid #d0d4dc;border-top:none}
.info-cell{padding:9pt 12pt;border-right:1pt solid #d0d4dc}
.info-cell:last-child{border-right:none}
.info-cell .label{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#666;margin-bottom:2pt}
.info-cell .value{font-size:10pt;font-weight:600;color:#111}
.summary-bar{display:flex;border:1pt solid #d0d4dc;border-top:none;margin-bottom:14pt}
.summary-cell{flex:1;padding:10pt 14pt;border-right:1pt solid #d0d4dc}
.summary-cell:last-child{border-right:none}
.summary-cell .label{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#666;margin-bottom:2pt}
.summary-cell .value{font-size:22pt;font-weight:800;color:#111;line-height:1}
.semester{margin-bottom:12pt;border:1pt solid #d0d4dc;border-radius:4pt;overflow:hidden}
.semester-header{background:#f3f4f6;padding:8pt 12pt;display:flex;justify-content:space-between;align-items:center;border-bottom:1pt solid #d0d4dc}
.semester-header .name{font-size:10pt;font-weight:700;color:#111}
.semester-header .meta{font-size:8pt;color:#666;margin-top:2pt}
.semester-header .stats{display:flex;gap:16pt;text-align:right}
.semester-header .stat-label{font-size:7pt;font-weight:700;text-transform:uppercase;color:#666}
.semester-header .stat-val{font-size:11pt;font-weight:800;color:#111}
table{width:100%;border-collapse:collapse;font-size:9pt}
thead tr{background:#f9fafb}
th{padding:6pt 10pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border-bottom:1pt solid #d0d4dc;text-align:left}
th.center,td.center{text-align:center}
td{padding:6pt 10pt;border-bottom:1pt solid #eef0f4;color:#111}
tbody tr:last-child td{border-bottom:none}
.badge{display:inline-block;padding:2pt 6pt;border-radius:999pt;font-size:7pt;font-weight:700}
.badge-a{background:#dcfce7;color:#15803d}
.badge-b{background:#dbeafe;color:#1d4ed8}
.badge-c{background:#fef9c3;color:#a16207}
.badge-f{background:#fee2e2;color:#b91c1c}
.code-col{color:#666;font-size:8.5pt}
.footer{margin-top:14pt;border-top:1pt solid #d0d4dc;padding-top:8pt;font-size:8pt;color:#888;text-align:center}
</style></head><body>
<div class="header-band">
  <img src="${logoSrc}" alt="MNU" onerror="this.style.display='none'"/>
  <div><h1>Minya National University</h1><p>Official Academic Transcript</p></div>
</div>
<div class="info-grid">
  <div class="info-cell"><div class="label">Student Name</div><div class="value">${student.name}</div></div>
  <div class="info-cell"><div class="label">Student ID</div><div class="value">${student.student_id}</div></div>
  <div class="info-cell"><div class="label">Department</div><div class="value">${student.department_name}</div></div>
  <div class="info-cell"><div class="label">Enrollment Year</div><div class="value">${student.enrollment_year}</div></div>
  <div class="info-cell"><div class="label">Academic Year</div><div class="value">Year ${student.year}</div></div>
  <div class="info-cell"><div class="label">Status</div><div class="value" style="text-transform:capitalize">${student.status}</div></div>
</div>
<div class="summary-bar">
  <div class="summary-cell"><div class="label">Total Credits</div><div class="value">${totalCredits}</div></div>
  <div class="summary-cell"><div class="label">Cumulative GPA</div><div class="value">${cumulativeGPA.toFixed(2)} <span style="font-size:11pt;font-weight:500;color:#666">/ 4.0</span></div></div>
</div>
${semestersHtml}
<div class="footer">
  Generated electronically by the MNU Student Management System on
  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
</div>
</body></html>`;

      // ── Render into a hidden off-screen iframe (exact A4 pixel width at 96dpi) ──
      const IFRAME_W = 794;
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${IFRAME_W}px;height:1px;border:none;visibility:hidden;overflow:hidden`;
      document.body.appendChild(iframe);

      await new Promise<void>((resolve, reject) => {
        iframe.onload = () => resolve();
        iframe.onerror = () => reject(new Error("iframe failed to load"));
        const iframeDoc = iframe.contentDocument!;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      });

      // Give the browser one rAF to finish layout + image paint
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 400));

      // ── Capture with html2canvas ──
      const { default: html2canvas } = await import("html2canvas");
      const iframeBody = iframe.contentDocument!.body;
      // Expand iframe height to full scrollable content so nothing clips
      const fullH = iframeBody.scrollHeight;
      iframe.style.height = fullH + "px";
      // One more rAF after resize so layout re-runs at full height
      await new Promise(r => requestAnimationFrame(r));

      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: IFRAME_W,
        windowHeight: fullH,
        width: IFRAME_W,
        height: fullH,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(iframe);

      // ── Slice into A4 pages and save (no margins — full bleed) ──
      const { jsPDF } = await import("jspdf");
      // A4 in mm: 210 × 297
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;

      // Map canvas pixels → mm (canvas is 2× scale, so canvas.width = IFRAME_W * 2)
      const mmPerPx = PAGE_W_MM / canvas.width;          // mm per canvas pixel
      const totalH_mm = canvas.height * mmPerPx;         // full content height in mm
      const pageH_mm  = PAGE_H_MM;                       // one A4 page height

      if (totalH_mm <= pageH_mm) {
        // Fits on one page — place at (0,0) full-bleed
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.97), "JPEG",
          0, 0, PAGE_W_MM, totalH_mm
        );
      } else {
        // Multi-page: slice canvas into strips of exactly one A4 page height
        const pxPerPage = Math.floor(pageH_mm / mmPerPx); // canvas pixels per page
        const totalPages = Math.ceil(canvas.height / pxPerPage);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();

          const srcY       = page * pxPerPage;
          const stripPxH   = Math.min(pxPerPage, canvas.height - srcY);
          const stripMmH   = stripPxH * mmPerPx;

          const strip = document.createElement("canvas");
          strip.width  = canvas.width;
          strip.height = stripPxH;
          strip.getContext("2d")!.drawImage(
            canvas, 0, srcY, canvas.width, stripPxH,
            0, 0, canvas.width, stripPxH
          );

          pdf.addImage(
            strip.toDataURL("image/jpeg", 0.97), "JPEG",
            0, 0, PAGE_W_MM, stripMmH
          );
        }
      }

      pdf.save(`transcript_${student.student_id}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Could not generate PDF. Please use the Print button and choose 'Save as PDF' instead.");
    } finally {
      setPdfLoading(false);
    }
  }, [student, totalCredits, cumulativeGPA, semesters]);



  const gpaColor = cumulativeGPA >= 3.5
    ? "var(--color-success)"
    : cumulativeGPA >= 2.5
    ? "var(--color-primary)"
    : cumulativeGPA >= 1.5
    ? "var(--color-warning)"
    : "var(--color-danger)";

  const gpaPercent = Math.min(100, Math.round((cumulativeGPA / 4.0) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Action bar */}
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem" }}>
        <button
          onClick={handlePrint}
          className="btn-ghost-cta"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            borderRadius: "0.5rem", border: "1px solid var(--border)",
            background: "var(--card)", color: "var(--foreground)",
            padding: "0.5rem 1.125rem", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm8-12V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4h10z" />
          </svg>
          Print
        </button>
        <button
          onClick={handleExportPDF}
          disabled={pdfLoading}
          className="btn-primary-cta"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            borderRadius: "0.5rem", background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            padding: "0.5rem 1.125rem", fontSize: "0.8125rem", fontWeight: 700,
            border: "none", cursor: pdfLoading ? "not-allowed" : "pointer",
            opacity: pdfLoading ? 0.7 : 1,
          }}
        >
          {pdfLoading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* Printable area */}
      <div ref={pdfRef} className="print-area">

        {/* Institutional header */}
        <div
          className="glass-card section-card"
          style={{
            "--delay": "80ms",
            padding: 0,
            overflow: "hidden",
          } as React.CSSProperties}
        >
          {/* Teal header band */}
          <div style={{
            background: "oklch(0.26 0.09 175)",
            padding: "1.75rem 2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}>
            <div style={{
              width: "3.5rem", height: "3.5rem", borderRadius: "50%",
              background: "oklch(0.96 0.015 90)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, padding: "0.25rem",
              overflow: "hidden",
            }}>
              <Image
                src="/mnu-logo.png"
                alt="Minya National University"
                width={52}
                height={52}
                style={{ objectFit: "contain" }}
                unoptimized
              />
            </div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "oklch(0.96 0.015 90)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                Minya National University
              </p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.78 0.08 175)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.25rem" }}>
                Official Academic Transcript
              </p>
            </div>
          </div>

          {/* Student identity grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 11rem), 1fr))",
            gap: 0,
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--border)",
          }}>
            {[
              { label: "Student Name", value: student.name },
              { label: "Student ID", value: student.student_id },
              { label: "Department", value: student.department_name },
              { label: "Enrollment Year", value: String(student.enrollment_year) },
              { label: "Academic Year", value: `Year ${student.year}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "0.875rem 0", paddingRight: "1.5rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                  {label}
                </p>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)", marginTop: "0.25rem" }}>
                  {value}
                </p>
              </div>
            ))}
            {/* Status with badge */}
            <div style={{ padding: "0.875rem 0", paddingRight: "1.5rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.375rem" }}>
                Status
              </p>
              <span className={statusBadgeClass(student.status)} style={{ textTransform: "capitalize" }}>
                {student.status}
              </span>
            </div>
          </div>

          {/* Summary mini-bento */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}>
            <div style={{ padding: "1.25rem 2rem", borderRight: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                Total Credits
              </p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: "var(--foreground)", marginTop: "0.375rem", fontVariantNumeric: "tabular-nums" } as React.CSSProperties}>
                {totalCredits}
              </p>
            </div>
            <div style={{ padding: "1.25rem 2rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                Cumulative GPA
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem", marginTop: "0.375rem" }}>
                <p style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: gpaColor, fontVariantNumeric: "tabular-nums" } as React.CSSProperties}>
                  {cumulativeGPA.toFixed(2)}
                </p>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--muted-foreground)" }}>/ 4.0</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={gpaPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Cumulative GPA: ${cumulativeGPA.toFixed(2)} out of 4.0`}
                style={{ height: "3px", borderRadius: "9999px", background: "var(--border)", marginTop: "0.625rem" }}
              >
                <div style={{ height: "3px", borderRadius: "9999px", background: gpaColor, width: `${gpaPercent}%`, transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Semester sections */}
        {semesters.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <svg className="empty-state-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              <p className="empty-state-title">No grades recorded</p>
              <p className="empty-state-body">Semester records will appear here once grades are entered.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {semesters.map((sem, idx) => {
              const semGpaColor = sem.gpa >= 3.5 ? "var(--color-success)" : sem.gpa >= 2.5 ? "var(--color-primary)" : sem.gpa >= 1.5 ? "var(--color-warning)" : "var(--color-danger)";
              return (
                <section
                  key={`${sem.semester}-${sem.academic_year}`}
                  className="glass-card section-card"
                  style={{ "--delay": `${200 + idx * 80}ms`, overflow: "hidden", padding: 0 } as React.CSSProperties}
                >
                  {/* Semester band */}
                  <div className="semester-band">
                    <div>
                      <p className="semester-band-label">{sem.semester} — {sem.academic_year}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.125rem" }}>
                        {sem.grades.length} subject{sem.grades.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Credits</p>
                        <p style={{ fontSize: "1.125rem", fontWeight: 800, lineHeight: 1, color: "var(--foreground)", letterSpacing: "-0.02em", marginTop: "0.125rem" }}>
                          {sem.totalCredits}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>GPA</p>
                        <p style={{ fontSize: "1.125rem", fontWeight: 800, lineHeight: 1, color: semGpaColor, letterSpacing: "-0.02em", marginTop: "0.125rem" }}>
                          {sem.gpa.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grade table */}
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Subject</th>
                          <th style={{ textAlign: "center" }}>Credits</th>
                          <th style={{ textAlign: "center" }}>Grade</th>
                          <th style={{ textAlign: "center" }}>Letter</th>
                          <th style={{ textAlign: "center" }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.grades.map((g, gi) => (
                          <tr key={gi}>
                            <td className="muted">{g.subject_code}</td>
                            <td>{g.subject_name}</td>
                            <td style={{ textAlign: "center" }}>{g.credits}</td>
                            <td style={{ textAlign: "center", fontWeight: 700 }}>{g.grade}</td>
                            <td style={{ textAlign: "center" }}>
                              <span className={letterBadgeClass(g.letter_grade)}>{g.letter_grade}</span>
                            </td>
                            <td style={{ textAlign: "center", fontWeight: 700, fontVariantNumeric: "tabular-nums" } as React.CSSProperties}>
                              {GPA_POINTS[g.letter_grade] !== undefined ? GPA_POINTS[g.letter_grade].toFixed(1) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
