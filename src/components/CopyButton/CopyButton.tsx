"use client";
import { useState, useCallback } from "react";
import styles from "./CopyButton.module.css";

interface CopyButtonProps {
  text: string;
  label: string;
  copiedLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CopyButton({ text, label, copiedLabel = "تم النسخ ✓", className, children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      className={`${styles.copyBtn} ${className ?? ""}`}
      onClick={handleCopy}
      aria-label={label}
      title={label}
    >
      {children ?? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied && <span className={styles.toast}>{copiedLabel}</span>}
    </button>
  );
}
