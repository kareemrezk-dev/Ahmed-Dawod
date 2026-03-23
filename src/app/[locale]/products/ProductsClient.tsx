"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { getCategoryLabel, type CategoryName, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { ProductsFilter } from "@/components/ProductsFilter/ProductsFilter";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./page.module.css";

const PAGE_SIZE = 12;

interface ProductsClientProps {
  locale: Locale;
  dict: Dictionary;
  allProducts: Product[];
  allCategories: CategoryName[];
  allBrands: string[];
}

export function ProductsClient({
  locale,
  dict,
  allProducts,
  allCategories,
  allBrands,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Active filters ──
  const rawCategory = searchParams.get("category");
  const rawBrand = searchParams.get("brand");
  const rawSize = searchParams.get("size");
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const activeCategory: CategoryName | null =
    rawCategory && (allCategories as string[]).includes(rawCategory)
      ? (rawCategory as CategoryName)
      : null;

  const activeBrand: string | null =
    rawBrand && allBrands.map((b) => b.toLowerCase()).includes(rawBrand.toLowerCase())
      ? allBrands.find((b) => b.toLowerCase() === rawBrand.toLowerCase()) ?? null
      : null;

  // ── Filter products ──
  let filtered = allProducts;
  if (activeCategory) filtered = filtered.filter((p) => p.category === activeCategory);
  if (activeBrand) filtered = filtered.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());
  if (rawSize) filtered = filtered.filter((p) => p.sizes?.some((s) => s.toLowerCase().includes(rawSize.toLowerCase())));

  // ── Pagination ──
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Build filter option arrays ──
  const categoryOptions = allCategories.map((cat) => {
    let base = allProducts;
    if (activeBrand) base = base.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());
    if (rawSize) base = base.filter((p) => p.sizes?.some((s) => s.toLowerCase().includes(rawSize.toLowerCase())));
    return {
      value: cat,
      label: getCategoryLabel(cat, locale),
      count: base.filter((p) => p.category === cat).length,
    };
  }).filter((o) => o.count > 0);

  const brandOptions = allBrands.map((brand) => {
    let base = allProducts;
    if (activeCategory) base = base.filter((p) => p.category === activeCategory);
    if (rawSize) base = base.filter((p) => p.sizes?.some((s) => s.toLowerCase().includes(rawSize.toLowerCase())));
    return {
      value: brand,
      label: brand,
      count: base.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length,
    };
  }).filter((o) => o.count > 0);

  const sizeBase = activeCategory
    ? activeBrand
      ? allProducts.filter((p) => p.category === activeCategory && p.brand.toLowerCase() === activeBrand.toLowerCase())
      : allProducts.filter((p) => p.category === activeCategory)
    : activeBrand
    ? allProducts.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase())
    : allProducts;

  const allSizes = [...new Set(sizeBase.flatMap((p) => p.sizes ?? []))].sort();
  const sizeOptions = allSizes.map((size) => ({
    value: size,
    label: size,
    count: sizeBase.filter((p) => p.sizes?.includes(size)).length,
  }));

  // ── Labels ──
  const resultsCount = filtered.length;
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
          activeSize={rawSize}
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
            {rawSize && ` · ${rawSize}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {totalPages > 1 && (
              <span className={styles.pageInfo}>
                {dict.products.pagination.page} {safePage} / {totalPages}
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
          {paginated.length === 0 ? (
            <p className={styles.empty}>{dict.products.empty}</p>
          ) : (
            paginated.map((product, i) => (
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
          currentPage={safePage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

