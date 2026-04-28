"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import {
  smartSearch,
  getProductName,
  getProductImagePath,
  getProductImageAlt,
  getCategoryLabel,
  type Product,
} from "@/lib/products";
import styles from "./Configurator.module.css";

interface ConfiguratorProps {
  locale: Locale;
  dict: Dictionary;
}

type FocusedField = "inner" | "outer" | "width" | null;

/* ── Interactive SVG Bearing Diagram ── */
function BearingDiagram({ focused }: { focused: FocusedField }) {
  const innerColor = focused === "inner" ? "#f59e0b" : "#2A5895";
  const outerColor = focused === "outer" ? "#f59e0b" : "#2A5895";
  const widthColor = focused === "width" ? "#f59e0b" : "#2A5895";
  const dimOpacity = 0.85;

  return (
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bearing dimensions diagram">
      {/* Outer ring */}
      <circle cx="120" cy="120" r="95" stroke="#cbd5e1" strokeWidth="2" fill="#f8fafc" />
      <circle cx="120" cy="120" r="95" stroke={outerColor} strokeWidth="2.5" fill="none" opacity={focused === "outer" ? 1 : 0.3} />

      {/* Bearing body (between outer and inner) */}
      <circle cx="120" cy="120" r="78" stroke="#e2e8f0" strokeWidth="1" fill="#eef2f7" />

      {/* Ball representations */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const r = 62;
        const cx = 120 + r * Math.cos((angle * Math.PI) / 180);
        const cy = 120 + r * Math.sin((angle * Math.PI) / 180);
        return (
          <circle key={angle} cx={cx} cy={cy} r="10" fill="#d1d9e6" stroke="#b8c4d4" strokeWidth="1" />
        );
      })}

      {/* Inner ring */}
      <circle cx="120" cy="120" r="42" stroke="#cbd5e1" strokeWidth="2" fill="#f1f5f9" />
      <circle cx="120" cy="120" r="42" stroke={innerColor} strokeWidth="2.5" fill="none" opacity={focused === "inner" ? 1 : 0.3} />

      {/* Center hole */}
      <circle cx="120" cy="120" r="28" fill="#fff" stroke="#e2e8f0" strokeWidth="1" />

      {/* ── d (inner diameter) dimension line ── */}
      <line x1="92" y1="120" x2="148" y2="120" stroke={innerColor} strokeWidth="1.5" opacity={dimOpacity} strokeDasharray={focused === "inner" ? "none" : "4 3"} />
      <line x1="92" y1="114" x2="92" y2="126" stroke={innerColor} strokeWidth="1.5" opacity={dimOpacity} />
      <line x1="148" y1="114" x2="148" y2="126" stroke={innerColor} strokeWidth="1.5" opacity={dimOpacity} />
      <text x="120" y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill={innerColor} fontFamily="monospace">d</text>

      {/* ── D (outer diameter) dimension line ── */}
      <line x1="25" y1="48" x2="120" y2="48" stroke={outerColor} strokeWidth="1.5" opacity={dimOpacity} strokeDasharray={focused === "outer" ? "none" : "4 3"} />
      {/* Vertical leaders */}
      <line x1="25" y1="42" x2="25" y2="54" stroke={outerColor} strokeWidth="1.5" opacity={dimOpacity} />
      <line x1="215" y1="42" x2="215" y2="54" stroke={outerColor} strokeWidth="1.5" opacity={dimOpacity} />
      <line x1="120" y1="48" x2="215" y2="48" stroke={outerColor} strokeWidth="1.5" opacity={dimOpacity} strokeDasharray={focused === "outer" ? "none" : "4 3"} />
      {/* Leader to circle */}
      <line x1="25" y1="54" x2="25" y2="120" stroke={outerColor} strokeWidth="1" opacity={0.3} strokeDasharray="2 2" />
      <line x1="215" y1="54" x2="215" y2="120" stroke={outerColor} strokeWidth="1" opacity={0.3} strokeDasharray="2 2" />
      <text x="120" y="43" textAnchor="middle" fontSize="11" fontWeight="700" fill={outerColor} fontFamily="monospace">D</text>

      {/* ── B (width) dimension line ── */}
      <line x1="218" y1="95" x2="218" y2="145" stroke={widthColor} strokeWidth="1.5" opacity={dimOpacity} strokeDasharray={focused === "width" ? "none" : "4 3"} />
      <line x1="212" y1="95" x2="224" y2="95" stroke={widthColor} strokeWidth="1.5" opacity={dimOpacity} />
      <line x1="212" y1="145" x2="224" y2="145" stroke={widthColor} strokeWidth="1.5" opacity={dimOpacity} />
      <text x="230" y="124" textAnchor="middle" fontSize="11" fontWeight="700" fill={widthColor} fontFamily="monospace">B</text>
    </svg>
  );
}

/* ── Main Configurator Component ── */
export function Configurator({ locale, dict }: ConfiguratorProps) {
  const [inner, setInner] = useState("");
  const [outer, setOuter] = useState("");
  const [width, setWidth] = useState("");
  const [focused, setFocused] = useState<FocusedField>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);

  const isAr = locale === "ar";

  const labels = {
    eyebrow: isAr ? "أداة البحث بالمقاس" : "Bearing Size Finder",
    title: isAr ? "ابحث عن البلية بالمقاس" : "Find a Bearing by Size",
    subtitle: isAr
      ? "أدخل القطر الداخلي والخارجي والعرض بالملليمتر"
      : "Enter inner diameter, outer diameter, and width in mm",
    inner: isAr ? "القطر الداخلي (d)" : "Inner Dia. (d)",
    outer: isAr ? "القطر الخارجي (D)" : "Outer Dia. (D)",
    width: isAr ? "العرض (B)" : "Width (B)",
    search: isAr ? "ابحث" : "Find Bearing",
    found: isAr ? "النتائج" : "Results",
    noMatch: isAr ? "لا توجد بلية بهذا المقاس" : "No bearing found with this size",
    closeSizes: isAr ? "مقاسات قريبة:" : "Close sizes:",
    idle: isAr
      ? "أدخل الأبعاد الثلاثة وسنجد البلية المطابقة لك"
      : "Enter all 3 dimensions and we'll find matching bearings",
    diagramHint: isAr
      ? "d = قطر داخلي · D = قطر خارجي · B = عرض"
      : "d = inner dia · D = outer dia · B = width",
  };

  const handleSearch = useCallback(() => {
    const i = parseFloat(inner);
    const o = parseFloat(outer);
    const w = parseFloat(width);
    if (isNaN(i) || isNaN(o) || isNaN(w)) return;
    if (i <= 0 || o <= 0 || w <= 0 || i >= o) return;

    const query = `${i}x${o}x${w}`;
    const result = smartSearch(query);
    setResults(result.products.slice(0, 6));
    setSuggestions(result.suggestions.slice(0, 4));
    setSearched(true);
  }, [inner, outer, width]);

  const canSearch =
    inner.trim() !== "" && outer.trim() !== "" && width.trim() !== "";

  return (
    <section className={styles.section} id="configurator">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <svg className={styles.eyebrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <span>{labels.eyebrow}</span>
          </div>
          <h2 className={styles.title}>{labels.title}</h2>
          <p className={styles.subtitle}>{labels.subtitle}</p>
        </div>

        {/* Main card */}
        <div className={styles.grid}>
          {/* Left: Diagram */}
          <div className={styles.diagramSide}>
            <div className={styles.diagramWrap}>
              <BearingDiagram focused={focused} />
            </div>
            <p className={styles.diagramHint}>{labels.diagramHint}</p>
          </div>

          {/* Right: Form + Results */}
          <div className={styles.formSide}>
            {/* Inputs */}
            <div className={styles.inputsRow}>
              {([
                { key: "inner" as const, label: labels.inner, value: inner, setter: setInner, ph: "20" },
                { key: "outer" as const, label: labels.outer, value: outer, setter: setOuter, ph: "47" },
                { key: "width" as const, label: labels.width, value: width, setter: setWidth, ph: "14" },
              ]).map((field) => (
                <div
                  key={field.key}
                  className={`${styles.inputGroup} ${focused === field.key ? styles.active : ""}`}
                >
                  <label className={styles.inputLabel}>{field.label}</label>
                  <div className={styles.inputWrap}>
                    <input
                      type="number"
                      className={styles.input}
                      value={field.value}
                      onChange={(e) => { field.setter(e.target.value); setSearched(false); }}
                      onFocus={() => setFocused(field.key)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.ph}
                      min="0"
                      step="any"
                      inputMode="decimal"
                    />
                    <span className={styles.inputUnit}>mm</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Search button */}
            <button
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={!canSearch}
              type="button"
            >
              <svg className={styles.searchBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              {labels.search}
            </button>

            {/* Results area */}
            <div className={styles.resultsArea}>
              {/* Idle state */}
              {!searched && (
                <div className={styles.idleState}>
                  <svg className={styles.idleIcon} viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
                  </svg>
                  <p>{labels.idle}</p>
                </div>
              )}

              {/* Results found */}
              {searched && results.length > 0 && (
                <>
                  <p className={styles.resultsTitle}>
                    {labels.found}
                    <span className={styles.resultsBadge}>
                      {inner} × {outer} × {width} mm
                    </span>
                  </p>
                  <div className={styles.resultsList}>
                    {results.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/${locale}/products/${p.slug}`}
                        className={styles.resultCard}
                      >
                        <span className={styles.cardThumb}>
                          <Image
                            src={getProductImagePath(p)}
                            alt={getProductImageAlt(p)}
                            width={56}
                            height={56}
                            className={styles.cardThumbImg}
                            unoptimized={getProductImagePath(p).endsWith(".svg")}
                          />
                        </span>
                        <span className={styles.cardInfo}>
                          <span className={styles.cardModel}>
                            {p.brand} {p.modelNumber}
                          </span>
                          <span className={styles.cardName}>
                            {getProductName(p, locale)} · {getCategoryLabel(p.category, locale)}
                          </span>
                        </span>
                        <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* No exact match */}
              {searched && results.length === 0 && (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="24" cy="24" r="20" />
                    <path d="M16 16l16 16M32 16L16 32" />
                  </svg>
                  <p>{labels.noMatch}</p>
                  {suggestions.length > 0 && (
                    <>
                      <p className={styles.suggestionsHint}>{labels.closeSizes}</p>
                      <div className={styles.resultsList} style={{ marginTop: "0.75rem" }}>
                        {suggestions.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/${locale}/products/${p.slug}`}
                            className={styles.resultCard}
                          >
                            <span className={styles.cardThumb}>
                              <Image
                                src={getProductImagePath(p)}
                                alt={getProductImageAlt(p)}
                                width={56}
                                height={56}
                                className={styles.cardThumbImg}
                                unoptimized={getProductImagePath(p).endsWith(".svg")}
                              />
                            </span>
                            <span className={styles.cardInfo}>
                              <span className={styles.cardModel}>
                                {p.brand} {p.modelNumber}
                              </span>
                              <span className={styles.cardName}>
                                {getProductName(p, locale)}
                              </span>
                            </span>
                            <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
