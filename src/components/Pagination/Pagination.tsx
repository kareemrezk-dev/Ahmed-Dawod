"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import styles from "./Pagination.module.css";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";

interface PaginationProps {
  locale: Locale;
  dict: Dictionary;
  currentPage: number;
  totalPages: number;
}

export function Pagination({ locale, dict, currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = useCallback(
    (page: number) => {
      const p = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        p.delete("page");
      } else {
        p.set("page", String(page));
      }
      router.push(`${pathname}?${p.toString()}`, { scroll: true });
    },
    [router, pathname, searchParams]
  );

  if (totalPages <= 1) return null;

  // Build page number array: always show first, last, current ±1, with ellipsis
  function getPages(): (number | "…")[] {
    const pages: (number | "…")[] = [];
    const delta = 1;
    const left = currentPage - delta;
    const right = currentPage + delta;
    let prev: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        if (prev !== null && i - prev > 1) pages.push("…");
        pages.push(i);
        prev = i;
      }
    }
    return pages;
  }

  const pages = getPages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {/* Prev */}
      <button
        className={`${styles.btn} ${currentPage === 1 ? styles.btnDisabled : ""}`}
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={dict.products.pagination.prev}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          style={{ transform: dir === "rtl" ? "none" : "scaleX(-1)" }}>
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{dict.products.pagination.prev}</span>
      </button>

      {/* Page numbers */}
      <div className={styles.pages}>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ""}`}
              onClick={() => goTo(p)}
              aria-label={`${dict.products.pagination.page} ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        className={`${styles.btn} ${currentPage === totalPages ? styles.btnDisabled : ""}`}
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={dict.products.pagination.next}
      >
        <span>{dict.products.pagination.next}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }}>
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
