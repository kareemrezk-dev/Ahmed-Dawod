"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { getCategoryLabel, type CategoryName, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { ProductsFilter } from "@/components/ProductsFilter/ProductsFilter";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./page.module.css";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ProductsClientProps {
  locale: Locale;
  dict: Dictionary;
  paginatedProducts: Product[];
  totalPages: number;
  currentPage: number;
  resultsCount: number;
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  sizeOptions: FilterOption[];
  activeCategory: CategoryName | null;
  activeBrand: string | null;
  activeSize: string | null;
}

export function ProductsClient({
  locale,
  dict,
  paginatedProducts,
  totalPages,
  currentPage,
  resultsCount,
  categoryOptions,
  brandOptions,
  sizeOptions,
  activeCategory,
  activeBrand,
  activeSize,
}: ProductsClientProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Labels ──
  const resultsLabel =
    locale === "ar"
      ? `${resultsCount} ${dict.products.resultsCount}`
      : `${resultsCount} ${dict.products.resultsCount}${resultsCount !== 1 ? "s" : ""}`;

  const filterBtnLabel = locale === "ar" ? "تصفية" : "Filter";

  return (
    <div className={styles.body}>
      {/* Backdrop for mobile filter */}
      <div
        className={`${styles.backdrop} ${filterOpen ? styles.backdropVisible : ""}`}
        onClick={() => setFilterOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ""}`}>
        <ProductsFilter
          locale={locale}
          dict={dict}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          sizeOptions={sizeOptions}
          activeCategory={activeCategory}
          activeBrand={activeBrand}
          activeSize={activeSize}
          onClose={() => setFilterOpen(false)}
        />
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            <span className={styles.resultsCountBold}>{resultsLabel}</span>
            {activeCategory && ` — ${getCategoryLabel(activeCategory, locale)}`}
            {activeBrand && ` · ${activeBrand}`}
            {activeSize && ` · ${activeSize}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {totalPages > 1 && (
              <span className={styles.pageInfo}>
                {dict.products.pagination.page} {currentPage} / {totalPages}
              </span>
            )}
            <button
              className={styles.filterToggle}
              onClick={() => setFilterOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {filterBtnLabel}
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {paginatedProducts.length === 0 ? (
            <p className={styles.empty}>{dict.products.empty}</p>
          ) : (
            paginatedProducts.map((product, i) => (
              <ProductCard
                key={product.slug}
                product={product}
                locale={locale}
                animationDelay={i * 40}
                whatsapp={dict.company.whatsappIntl}
              />
            ))
          )}
        </div>

        <Pagination
          locale={locale}
          dict={dict}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

