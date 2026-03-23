"use client";
import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#ef4444" strokeWidth="2" opacity="0.3" />
            <path d="M24 14v12M24 32v2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className={styles.title}>حدث خطأ ما</h2>
        <p className={styles.subtitle}>لم نتمكن من تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.</p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryBtn}>
            حاول مرة أخرى
          </button>
          <Link href="/ar/products" className={styles.backLink}>
            العودة للمنتجات
          </Link>
        </div>
      </div>
    </div>
  );
}
