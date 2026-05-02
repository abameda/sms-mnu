"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) { setError("Invalid username or password"); setLoading(false); return; }
      const session = await fetch("/api/auth/session").then(r => r.json());
      const role = session?.user?.role;
      if (role === "admin" || role === "student_affairs") router.push("/admin/dashboard");
      else if (role === "student") router.push("/student/dashboard");
      else router.push("/");
    } catch { setError("An error occurred. Please try again."); setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"var(--background)",
      position:"relative",
      overflow:"hidden",
      padding:"1.5rem",
    }}>
      {/* Ambient glow */}
      <div className="dashboard-glow-bg" aria-hidden="true" />

      {/* Login card */}
      <div style={{
        position:"relative",
        zIndex:1,
        width:"100%",
        maxWidth:"24rem",
        background:"oklch(0.195 0.008 220 / 0.75)",
        backdropFilter:"blur(24px) saturate(1.5)",
        WebkitBackdropFilter:"blur(24px) saturate(1.5)",
        border:"1px solid oklch(0.38 0.010 220 / 0.7)",
        borderRadius:"1.25rem",
        padding:"2.5rem 2rem",
        boxShadow:"0 0 0 1px oklch(0.50 0.010 220 / 0.08) inset, 0 24px 64px oklch(0.05 0.005 220 / 0.6)",
      }}>

        {/* Header */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem", marginBottom:"2rem" }}>
          <div style={{
            width:"4.5rem", height:"4.5rem",
            borderRadius:"1rem",
            background:"oklch(0.26 0.09 175)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 16px oklch(0.26 0.09 175 / 0.4)",
            overflow:"hidden",
          }}>
            <Image src="/mnu-logo.png" alt="Minya National University" width={60} height={60} style={{ objectFit:"contain" }} priority />
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-foreground)" }}>
              Minya National University
            </p>
            <h1 style={{ fontSize:"1.375rem", fontWeight:800, color:"var(--foreground)", lineHeight:1.2, letterSpacing:"-0.025em", marginTop:"0.25rem" }}>
              Student Management
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.125rem" }}>
          {error && (
            <div className="error-surface" role="alert">
              <div style={{ display:"flex", alignItems:"flex-start", gap:"0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink:0, marginTop:"0.125rem" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-cta"
            style={{
              width:"100%",
              padding:"0.6875rem 1rem",
              fontSize:"0.9375rem",
              fontWeight:700,
              borderRadius:"0.625rem",
              background:"var(--color-primary)",
              color:"var(--color-primary-foreground)",
              border:"none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:"0.5rem",
              marginTop:"0.5rem",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width:"1rem", height:"1rem", borderTopColor:"var(--color-primary-foreground)", borderColor:"oklch(0.14 0.04 50 / 0.3)" }} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Inline copyright – no navbar, no footer */}
          <p style={{
            marginTop:"1rem",
            textAlign:"center",
            fontSize:"0.6875rem",
            color:"oklch(0.42 0.008 220)",
            lineHeight:1.6,
          }}>
            © 2026{" "}
            <a
              href="https://www.shorbagy.space/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color:"oklch(0.65 0.14 50)", textDecoration:"none", fontWeight:600, transition:"color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.80 0.18 50)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "oklch(0.65 0.14 50)")}
            >
              Abdelhmeed Elshorbagy
            </a>
            {" "}· All rights reserved
          </p>
        </form>

      </div>
    </div>
  );
}
