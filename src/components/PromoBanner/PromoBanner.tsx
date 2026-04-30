"use client";

import { useState } from "react";
import styles from "./PromoBanner.module.css";
import type { Locale } from "@/lib/i18n";

export function PromoBanner({ locale }: { locale: Locale }) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isVisible) return null;

  const isAr = locale === "ar";
  
  const handleCopy = () => {
    navigator.clipboard.writeText("DAWOD10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.banner} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.content}>
        <div className={styles.text}>
          <div className={styles.headerRow}>
            <span className={styles.icon}>🎁</span>
            <span className={styles.title}>{isAr ? "خصم خاص لك!" : "Special Offer!"}</span>
          </div>
          <span className={styles.messageText}>
            {isAr ? "استخدم الكود التالي عند الطلب عبر الواتساب للحصول على خصم 10%:" : "Use this code when ordering via WhatsApp for 10% off:"}
          </span>
          <button 
            onClick={handleCopy} 
            className={`${styles.couponCode} ${copied ? styles.copied : ""}`}
            title={isAr ? "اضغط للنسخ" : "Click to copy"}
          >
            {copied ? (isAr ? "تم النسخ! ✅" : "Copied! ✅") : "DAWOD10"}
          </button>
        </div>
      </div>
      <button 
        className={styles.closeBtn} 
        onClick={() => setIsVisible(false)}
        aria-label="Close promo banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}
