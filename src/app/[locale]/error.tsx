"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./global-error.module.css";

const COPY = {
  ar: {
    title: "حدث خطأ غير متوقع",
    subtitle: "لا تقلق، هذه الأمور تحدث أحياناً. جرّب مرة أخرى أو ارجع للرئيسية.",
    errorCode: "رمز الخطأ:",
    retry: "حاول مرة أخرى",
    home: "الرئيسية",
  },
  en: {
    title: "An unexpected error occurred",
    subtitle: "Don't worry, these things happen sometimes. Try again or go back to the home page.",
    errorCode: "Error code:",
    retry: "Try again",
    home: "Home",
  },
} as const;

type SupportedLocale = keyof typeof COPY;

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] as SupportedLocale;
  const locale: SupportedLocale = pathLocale in COPY ? pathLocale : "ar";
  const c = COPY[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.bgRings} aria-hidden="true">
        <div className={styles.ring1} />
        <div className={styles.ring2} />
      </div>

      <div className={styles.inner}>
        {/* Broken bearing illustration */}
        <div className={styles.iconWrap} aria-hidden="true">
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <circle cx="45" cy="45" r="40" stroke="#ef4444" strokeWidth="2" opacity="0.15" />
            <circle cx="45" cy="45" r="32" stroke="#ef4444" strokeWidth="7" fill="none" opacity="0.12" />
            <circle cx="45" cy="45" r="32" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="45" cy="45" r="20" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
            {[0,1,2,3,4,5].map(i => {
              const a = (i/6)*2*Math.PI;
              const active = i !== 2; // one "broken" ball
              return <circle key={i}
                cx={45+20*Math.cos(a)} cy={45+20*Math.sin(a)}
                r="5" fill={active ? "#fecaca" : "#fee2e2"}
                stroke={active ? "#ef4444" : "#fca5a5"} strokeWidth="1.5"
                opacity={active ? 1 : 0.4}
              />;
            })}
            <circle cx="45" cy="45" r="11" stroke="#ef4444" strokeWidth="2" fill="#fff5f5" />
            <path d="M42 42l6 6M48 42l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.subtitle}>{c.subtitle}</p>

        {error.digest && (
          <p className={styles.digest}>{c.errorCode} <code>{error.digest}</code></p>
        )}

        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryBtn}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M1.5 7.5A6 6 0 0 1 12 3M13.5 7.5A6 6 0 0 1 3 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              <path d="M10.5 3l1.5 0 0 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {c.retry}
          </button>
          <Link href={`/${locale}`} className={styles.backLink}>{c.home}</Link>
        </div>
      </div>
    </div>
  );
}

