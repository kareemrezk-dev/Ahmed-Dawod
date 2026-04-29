"use client";

import { useState } from "react";
import { ProductDashboard } from "@/components/admin/ProductDashboard";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export default function AdminPage() {
  const [view, setView] = useState<"dashboard" | "products">("dashboard");

  return (
    <>
      {/* Global tab bar — rendered above whichever view is active */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        gap: 4,
        background: "rgba(15,17,21,0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <button
          onClick={() => setView("dashboard")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: view === "dashboard" ? "rgba(59,130,246,0.2)" : "transparent",
            color: view === "dashboard" ? "#60a5fa" : "#6b7280",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          لوحة التحكم
        </button>
        <button
          onClick={() => setView("products")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: view === "products" ? "rgba(59,130,246,0.2)" : "transparent",
            color: view === "products" ? "#60a5fa" : "#6b7280",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
          </svg>
          إدارة المنتجات
        </button>
      </div>

      {/* Views */}
      {view === "dashboard" ? <DashboardStandalone /> : <ProductDashboard />}
    </>
  );
}

/** Wraps DashboardOverview with the same auth flow the ProductDashboard uses */
function DashboardStandalone() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if already authed
  useState(() => {
    fetch("/api/admin/verify").then(r => {
      if (r.ok) setAuthed(true);
    }).catch(() => {});
  });

  const submit = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) setAuthed(true);
      else { setError(true); setTimeout(() => setError(false), 1500); }
    } catch {
      setError(true); setTimeout(() => setError(false), 1500);
    }
    setChecking(false);
  };

  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0f12",
        fontFamily: "'Cairo', sans-serif",
      }}>
        <div style={{
          width: 360,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
        }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/>
              <line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/>
            </svg>
          </div>
          <h1 style={{ color: "#f0f0f0", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>أحمد داود</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>لوحة التحكم</p>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="كلمة المرور"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                paddingLeft: 40,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10,
                color: "#f0f0f0",
                fontSize: 14,
                outline: "none",
                fontFamily: "'Cairo', sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#8a92a3", padding: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
          {error && <p style={{ color: "#ef4444", fontSize: 12, margin: "0 0 8px" }}>كلمة المرور غلط</p>}
          <button
            onClick={submit}
            disabled={checking}
            style={{
              width: "100%",
              padding: "10px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking ? "..." : "دخول"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0f12",
      fontFamily: "'Cairo', sans-serif",
      color: "#f0f0f0",
    }}>
      {/* Header */}
      <header style={{
        padding: "14px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#d1d5db" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          AHMED DAWOD — لوحة التحكم
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/ar" style={{
            padding: "6px 14px",
            fontSize: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#9ca3af",
            textDecoration: "none",
            transition: "all 0.15s",
          }}>
            ← الموقع
          </a>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>
        <DashboardOverview />
      </div>
    </div>
  );
}
