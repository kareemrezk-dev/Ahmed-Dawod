"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./LocaleSwitcher.module.css";
import type { Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function getLocalizedPath(target: Locale): string {
    if (!pathname) return `/${target}`;
    const segs = pathname.split("/");
    segs[1] = target;
    return segs.join("/") || `/${target}`;
  }

  const options: { locale: Locale; label: string; lang: string }[] = [
    { locale: "ar", label: "AR", lang: "ar" },
    { locale: "en", label: "EN", lang: "en" },
  ];

  return (
    <nav className={styles.switcher} role="navigation" aria-label="Language switcher">
      {options.map((opt, i) => (
        <span key={opt.locale} style={{ display: "contents" }}>
          {i > 0 && <span className={styles.divider} aria-hidden="true" />}
          <Link
            href={getLocalizedPath(opt.locale)}
            className={`${styles.option} ${locale === opt.locale ? styles.active : ""}`}
            aria-current={locale === opt.locale ? "true" : undefined}
            lang={opt.lang}
          >
            {opt.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
