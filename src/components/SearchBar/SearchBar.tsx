"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchProducts, getProductName, getCategoryLabel, type Product } from "@/lib/products";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  locale: Locale;
  dict: Dictionary;
}

export function SearchBar({ locale, dict }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(() => {
      const res = searchProducts(query).slice(0, 6);
      setResults(res);
      setOpen(res.length > 0);
      setActiveIdx(-1);
    }, 120);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToProduct = useCallback((slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/${locale}/products/${slug}`);
  }, [locale, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter") {
      if (activeIdx >= 0 && results[activeIdx]) { goToProduct(results[activeIdx].slug); return; }
      if (query.trim().length >= 2) {
        setOpen(false);
        router.push(`/${locale}/products?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  const dir = locale === "ar" ? "rtl" : "ltr";
  const placeholder = dict.search.placeholder;

  return (
    <div className={styles.bar} dir={dir}>
      <div className={styles.inner} ref={wrapRef} role="search">
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            aria-label={placeholder}
            aria-expanded={open}
            aria-autocomplete="list"
            autoComplete="off"
            dir={dir}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
              aria-label="Clear"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l11 11M12 1L1 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <ul className={styles.dropdown} role="listbox" aria-label={dict.search.resultsFor}>
            {results.map((p, i) => {
              const name = getProductName(p, locale);
              return (
                <li
                  key={p.slug}
                  role="option"
                  aria-selected={i === activeIdx}
                  className={`${styles.item} ${i === activeIdx ? styles.itemActive : ""}`}
                  onMouseDown={() => goToProduct(p.slug)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className={styles.itemModel}>{p.brand} {p.modelNumber}</span>
                  <span className={styles.itemName}>{name}</span>
                  <span className={styles.itemCat}>{getCategoryLabel(p.category, locale)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
