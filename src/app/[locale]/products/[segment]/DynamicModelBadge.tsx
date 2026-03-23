"use client";
import React, { useState } from "react";

interface ModelBadgeProps {
  basePartNumber: string;
  modelLabel: string;
}

export function DynamicModelBadge({ basePartNumber, modelLabel }: ModelBadgeProps) {
  const [model, setModel] = useState(basePartNumber);

  React.useEffect(() => {
    setModel(basePartNumber);
  }, [basePartNumber]);

  React.useEffect(() => {
    function handler(e: Event) {
      const ev = e as CustomEvent<string>;
      setModel(ev.detail || basePartNumber);
    }
    window.addEventListener("modelSelected", handler);
    return () => window.removeEventListener("modelSelected", handler);
  }, [basePartNumber]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.18)",
      borderRadius: "10px", padding: "0.6rem 1rem", marginTop: "0.5rem",
    }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)" }}>
        {modelLabel}
      </span>
      <span style={{ fontSize: "1rem", fontWeight: 900, color: "var(--color-primary)", letterSpacing: "0.04em", fontFamily: '"SF Mono","Fira Code",monospace' }}>
        {model}
      </span>
    </div>
  );
}
