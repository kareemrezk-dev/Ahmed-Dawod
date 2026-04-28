import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { getProductsByTopCategory, topCategoryLabels, type TopCategory } from "@/lib/products";
import styles from "./CategoriesGrid.module.css";

/* ── One SVG per top-category ── */
function CategoryIcon({ type }: { type: string }) {
  switch (type) {
    case "bearings":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <circle cx="44" cy="44" r="38" stroke="#1d4ed8" strokeWidth="2" opacity="0.8" />
          {[0,1,2,3,4,5,6,7].map((i) => { const a=(i/8)*2*Math.PI; return <circle key={i} cx={44+30*Math.cos(a)} cy={44+30*Math.sin(a)} r="4.5" fill="#1d4ed8" opacity="0.7" />; })}
          <circle cx="44" cy="44" r="18" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.5" />
          <circle cx="44" cy="44" r="7" fill="rgba(29,78,216,0.15)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.8" />
          <circle cx="44" cy="44" r="2.5" fill="#1d4ed8" opacity="0.9" />
        </svg>
      );
    case "linear":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <rect x="8" y="32" width="72" height="26" rx="5" stroke="#1d4ed8" strokeWidth="2" opacity="0.8" />
          <rect x="16" y="36" width="18" height="18" rx="3" fill="#1d4ed8" opacity="0.25" stroke="#1d4ed8" strokeWidth="1.5" />
          <rect x="54" y="36" width="18" height="18" rx="3" fill="#1d4ed8" opacity="0.25" stroke="#1d4ed8" strokeWidth="1.5" />
          <line x1="8" y1="44" x2="80" y2="44" stroke="#1d4ed8" strokeWidth="1" opacity="0.3" strokeDasharray="4 4" />
          <circle cx="25" cy="45" r="4" fill="#1d4ed8" opacity="0.4" />
          <circle cx="63" cy="45" r="4" fill="#1d4ed8" opacity="0.4" />
        </svg>
      );
    case "ball-screw":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <line x1="10" y1="44" x2="78" y2="44" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {[16,24,32,40,48,56,64,72].map((x) => <circle key={x} cx={x} cy="44" r="5.5" fill="#1d4ed8" opacity="0.55" />)}
          <rect x="8" y="36" width="8" height="16" rx="2" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.65" />
          <rect x="72" y="36" width="8" height="16" rx="2" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.65" />
          <path d="M16 34 Q24 24 32 34 Q40 44 48 34 Q56 24 64 34 Q72 44 72 34" stroke="#1d4ed8" strokeWidth="1" opacity="0.3" fill="none" />
        </svg>
      );
    case "hard-chrome":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <rect x="34" y="8" width="20" height="72" rx="10" stroke="#1d4ed8" strokeWidth="2" opacity="0.7" />
          <rect x="38" y="8" width="12" height="72" rx="6" fill="#1d4ed8" opacity="0.08" />
          {[20,30,40,50,60,70].map((y) => <line key={y} x1="34" y1={y} x2="54" y2={y} stroke="#1d4ed8" strokeWidth="1" opacity="0.3" />)}
          <circle cx="44" cy="44" r="7" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.45" />
        </svg>
      );
    case "lead-screw":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <line x1="44" y1="8" x2="44" y2="80" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {[12,18,24,30,36,42,48,54,60,66,72].map((y, i) => (
            <path key={i} d={`M${i%2===0?32:56} ${y} L${i%2===0?56:32} ${y+6}`} stroke="#1d4ed8" strokeWidth="1.75" strokeLinecap="round" opacity="0.6" />
          ))}
        </svg>
      );
    case "fasteners":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <circle cx="44" cy="28" r="14" stroke="#1d4ed8" strokeWidth="2" opacity="0.7" />
          <line x1="26" y1="28" x2="62" y2="28" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.4" />
          <line x1="30" y1="20" x2="58" y2="20" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.4" />
          <rect x="40" y="42" width="8" height="34" rx="4" fill="#1d4ed8" opacity="0.4" />
          <line x1="30" y1="64" x2="58" y2="64" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="30" y1="72" x2="58" y2="72" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "housings":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <rect x="10" y="54" width="68" height="26" rx="5" stroke="#1d4ed8" strokeWidth="2" opacity="0.7" />
          <circle cx="44" cy="50" r="22" stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
          <circle cx="44" cy="50" r="10" fill="rgba(29,78,216,0.1)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.7" />
          <circle cx="44" cy="50" r="3.5" fill="#1d4ed8" opacity="0.6" />
          <circle cx="18" cy="70" r="4.5" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.55" />
          <circle cx="70" cy="70" r="4.5" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.55" />
        </svg>
      );
    case "pulleys":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <circle cx="44" cy="44" r="36" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
          <circle cx="44" cy="44" r="27" stroke="#1d4ed8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          <circle cx="44" cy="44" r="16" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.55" />
          <circle cx="44" cy="44" r="5.5" fill="#1d4ed8" opacity="0.6" />
          {[0,1,2,3,4,5,6,7].map((i) => { const a=(i/8)*2*Math.PI; return <line key={i} x1={44+7*Math.cos(a)} y1={44+7*Math.sin(a)} x2={44+14*Math.cos(a)} y2={44+14*Math.sin(a)} stroke="#1d4ed8" strokeWidth="1.5" opacity="0.45" />; })}
        </svg>
      );
    case "misc":
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <rect x="8" y="8" width="32" height="32" rx="5" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
          <rect x="48" y="8" width="32" height="32" rx="5" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
          <rect x="8" y="48" width="32" height="32" rx="5" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
          <circle cx="64" cy="64" r="16" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
          <circle cx="64" cy="64" r="5" fill="#1d4ed8" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true" className={styles.cardVisualIcon}>
          <circle cx="44" cy="44" r="36" stroke="#1d4ed8" strokeWidth="2" opacity="0.7" />
          <circle cx="44" cy="44" r="12" fill="rgba(29,78,216,0.15)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.8" />
        </svg>
      );
  }
}

const TOP_CATEGORIES: TopCategory[] = [
  "bearings", "linear", "ball-screw", "hard-chrome",
  "lead-screw", "fasteners", "housings", "pulleys", "misc",
];

const CAT_IMAGE_EXT: Record<TopCategory, string> = {
  "bearings": "png",
  "linear": "png",
  "ball-screw": "png",
  "hard-chrome": "png",
  "lead-screw": "png",
  "fasteners": "png",
  "housings": "png",
  "pulleys": "png",
  "misc": "png"
};

export async function CategoriesGrid({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const sectionEyebrow =
    locale === "ar" ? "ما نقدمه" :
    "What we offer";

  const browseLabel =
    locale === "ar" ? "تصفح" :
    "Browse";

  const viewProductsLabel =
    locale === "ar" ? "عرض المنتجات" :
    "View products";

  return (
    <section className={styles.section} aria-labelledby="categories-heading">
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowRule} />
            <span className={styles.eyebrowText}>{sectionEyebrow}</span>
          </div>
          <h2 className={styles.sectionTitle} id="categories-heading">
            {dict.categories.title}
          </h2>
        </header>

        <div className={styles.grid}>
          {TOP_CATEGORIES.map((topCat, index) => {
            const labels = topCategoryLabels[topCat];
            const label =
              locale === "ar" ? labels.ar : labels.en;
            const count = getProductsByTopCategory(topCat).length;

            return (
              <Link
                key={topCat}
                href={`/${locale}/products/${topCat}`}
                className={styles.card}
                prefetch={false}
                style={{ animationDelay: `${index * 55}ms` } as React.CSSProperties}
              >
                <div className={styles.cardVisual} style={{ position: "relative" }}>
                  <Image
                    src={`/images/categories/${topCat}.${CAT_IMAGE_EXT[topCat]}`}
                    alt={label}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div className={styles.cardVisualOverlay}>
                    <span className={styles.cardBadge} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.cardCount}>
                      {count} {locale === "ar" ? "منتج" : "Products"}
                    </span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{label}</h3>
                  <span className={styles.cardMeta}>{viewProductsLabel}</span>
                </div>
                <div className={styles.cardArrow}>
                  <span>{browseLabel}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                    className={styles.arrowIcon}
                    style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }}
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
