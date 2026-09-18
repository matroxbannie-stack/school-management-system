"use client";
import { useEffect, useState } from "react";

export default function WelcomePopup() {
  const [name, setName] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("justLoggedIn");
    if (stored) {
      setName(stored);
      sessionStorage.removeItem("justLoggedIn");
      const t = setTimeout(() => setName(null), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!name) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        background: "#111827",
        color: "#fff",
        padding: "14px 18px",
        borderRadius: 12,
        boxShadow: "0 12px 30px #0005",
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 14,
        maxWidth: 320,
      }}
    >
      <span>?? Welcome back, <b>{name}</b>!</span>
      <button
        onClick={() => setName(null)}
        style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
