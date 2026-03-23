"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./SearchOverlay.module.css";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { searchProducts, getCategoryLabel, getProductName, getProductImagePath, getProductImageAlt } from "@/lib/products";
import type { Product } from "@/lib/products";

interface SearchOverlayProps {
  locale: Locale;
  dict: Dictionary;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.highlight}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchOverlay({ locale, dict, isOpen, onClose, initialQuery = "" }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 220);

  // Run search whenever debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setResults(searchProducts(debouncedQuery).slice(0, 8));
  }, [debouncedQuery]);

  // Focus input when opened — and seed with initialQuery if provided
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen, initialQuery]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const brandGroups = results.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.brand]) acc[p.brand] = [];
    acc[p.brand].push(p);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={dict.search.placeholder}
    >
      <div className={styles.panel}>
        {/* Search input row */}
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.search.placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-label={dict.search.placeholder}
          />
          {query.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label={dict.search.close}>
            {dict.search.close}
          </button>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {debouncedQuery.trim().length >= 2 && results.length === 0 && (
            <p className={styles.noResults}>{dict.search.noResults}</p>
          )}

          {results.length > 0 && (
            <div className={styles.resultsInner}>
              <p className={styles.resultsLabel}>
                {dict.search.resultsFor}{" "}
                <strong>&ldquo;{debouncedQuery}&rdquo;</strong>
                {" — "}{results.length} {dict.search.resultsCount}
              </p>
              {(Object.entries(brandGroups) as [string, Product[]][]).map(([brand, brandProducts]) => (
                <div key={brand} className={styles.group}>
                  <span className={styles.groupLabel}>{brand}</span>
                  <ul className={styles.groupList} role="listbox">
                    {brandProducts.map((p) => (
                      <li key={p.slug} role="option" aria-selected="false">
                        <Link
                          href={`/${locale}/products/${p.slug}`}
                          className={styles.resultItem}
                          onClick={onClose}
                        >
                          <span className={styles.resultThumb}>
                            <Image
                              src={getProductImagePath(p)}
                              alt={getProductImageAlt(p)}
                              width={40}
                              height={40}
                              className={styles.resultThumbImg}
                              unoptimized={getProductImagePath(p).endsWith(".svg")}
                            />
                          </span>
                          <span className={styles.resultTextCol}>
                            <span className={styles.resultModel}>
                              <HighlightMatch text={p.modelNumber} query={debouncedQuery} />
                            </span>
                            <span className={styles.resultName}>
                              <HighlightMatch text={getProductName(p, locale)} query={debouncedQuery} />
                            </span>
                          </span>
                          <span className={styles.resultCategory}>{getCategoryLabel(p.category, locale)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() => {
                  onClose();
                  router.push(`/${locale}/products?q=${encodeURIComponent(debouncedQuery.trim())}`);
                }}
              >
                {dict.search.viewAll}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: locale === 'ar' ? 'scaleX(-1)' : 'none' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className={styles.hint}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="18" cy="18" r="12" stroke="var(--border)" strokeWidth="2" />
                <path d="M27 27l6 6" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>{dict.search.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
