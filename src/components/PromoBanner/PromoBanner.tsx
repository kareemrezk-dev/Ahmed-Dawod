"use client";

import { useState } from "react";
import styles from "./PromoBanner.module.css";
import type { Locale } from "@/lib/i18n";

export function PromoBanner({ locale }: { locale: Locale }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isAr = locale === "ar";
  const message = isAr 
    ? "🎉 اطلب الآن عبر الواتساب واستخدم كود الخصم DAWOD10 للحصول على خصم 10%!"
    : "🎉 Order now via WhatsApp and use code DAWOD10 for a 10% discount!";

  return (
    <div className={styles.banner} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.content}>
        <p>{message}</p>
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
