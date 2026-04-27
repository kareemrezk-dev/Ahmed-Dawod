"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import {
  getProductsByTopCategory,
  getAllBrands, topCategoryLabels, topCategoryMap,
  getCategoryLabel,
  type TopCategory, type Product, type CategoryName,
} from "@/lib/products";
import type { PricingOverrides } from "@/lib/pricing";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { ProductsFilter } from "@/components/ProductsFilter/ProductsFilter";
import { Pagination } from "@/components/Pagination/Pagination";
import listStyles from "./list.module.css";

const PAGE_SIZE = 12;

interface CategoryListClientProps {
  locale: Locale;
  dict: Dictionary;
  topCat: TopCategory;
  pricingOverrides: PricingOverrides;
}

function CategoryListInner({ locale, dict, topCat, pricingOverrides }: CategoryListClientProps) {
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const labels = topCategoryLabels[topCat];
  const subcategories = topCategoryMap[topCat];
  const allCatProducts = getProductsByTopCategory(topCat);
  const allBrands = getAllBrands();

  const rawSub = searchParams.get("subcategory") ?? searchParams.get("category") ?? null;
  const rawBrand = searchParams.get("brand") ?? null;
  const rawSize = searchParams.get("size") ?? null;
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const activeSub = rawSub && (subcategories as string[]).includes(rawSub) ? rawSub : null;
  const activeBrand = rawBrand
    ? allBrands.find((b) => b.toLowerCase() === rawBrand.toLowerCase()) ?? null
    : null;

  let filtered: Product[] = allCatProducts;
  if (activeSub) filtered = filtered.filter((p) => p.category === activeSub);
  if (activeBrand) filtered = filtered.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());
  if (rawSize) filtered = filtered.filter((p) => p.sizes?.some((s) => s.toLowerCase().includes(rawSize.toLowerCase())));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const subcategoryOptions = subcategories.map((sub) => {
    let base = allCatProducts;
    if (activeBrand) base = base.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());
    return { value: sub, label: getCategoryLabel(sub, locale), count: base.filter((p) => p.category === sub).length };
  }).filter((o) => o.count > 0);

  const brandOptions = allBrands.map((brand) => {
    let base = allCatProducts;
    if (activeSub) base = base.filter((p) => p.category === activeSub);
    return { value: brand, label: brand, count: base.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length };
  }).filter((o) => o.count > 0);

  const sizeBase = activeSub
    ? activeBrand ? allCatProducts.filter((p) => p.category === activeSub && p.brand.toLowerCase() === activeBrand.toLowerCase()) : allCatProducts.filter((p) => p.category === activeSub)
    : activeBrand ? allCatProducts.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase()) : allCatProducts;

  const allSizes = [...new Set(sizeBase.flatMap((p) => p.sizes ?? []))].sort();
  const sizeOptions = allSizes.map((size) => ({ value: size, label: size, count: sizeBase.filter((p) => p.sizes?.includes(size)).length }));

  const resultsCount = filtered.length;
  const resultsLabel = locale === "ar" ? `${resultsCount} ${dict.products.resultsCount}` : `${resultsCount} ${dict.products.resultsCount}${resultsCount !== 1 ? "s" : ""}`;

  return (
    <>
      <div className={`${listStyles.sidebarOverlay} ${isFilterOpen ? listStyles.sidebarOverlayOpen : ""}`} onClick={() => setIsFilterOpen(false)} />
      <div className={listStyles.body}>
        <aside className={`${listStyles.sidebar} ${isFilterOpen ? listStyles.sidebarOpen : ""}`}>
          <div className={listStyles.mobileSidebarHeader}>
            <span>{locale === "ar" ? "تصفية المنتجات" : "Filter Products"}</span>
            <button className={listStyles.closeFilterBtn} onClick={() => setIsFilterOpen(false)}>✕</button>
          </div>
          <ProductsFilter locale={locale} dict={dict} categoryOptions={subcategoryOptions}
            brandOptions={brandOptions} sizeOptions={sizeOptions}
            activeCategory={activeSub} activeBrand={activeBrand} activeSize={rawSize} />
        </aside>
        <div className={listStyles.main}>
          <div className={listStyles.resultsHeader}>
            <span className={listStyles.resultsCount}>
              <span className={listStyles.resultsCountBold}>{resultsLabel}</span>
              {activeSub && ` — ${getCategoryLabel(activeSub as CategoryName, locale)}`}{activeBrand && ` · ${activeBrand}`}
            </span>
            <div className={listStyles.headerActions}>
              {totalPages > 1 && <span className={listStyles.pageInfo}>{dict.products.pagination.page} {safePage} / {totalPages}</span>}
              <button className={listStyles.mobileFilterBtn} onClick={() => setIsFilterOpen(true)}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                 {locale === "ar" ? "تصفية" : "Filter"}
              </button>
            </div>
          </div>
          <div className={listStyles.grid}>
            {paginated.length === 0
              ? <p className={listStyles.empty}>{dict.products.empty}</p>
              : paginated.map((product, i) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  locale={locale}
                  animationDelay={i * 40}
                  whatsapp={dict.company.whatsappIntl}
                  pricing={pricingOverrides[product.slug] ?? null}
                />
              ))
            }
          </div>
          <Pagination locale={locale} dict={dict} currentPage={safePage} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}

export function CategoryListClient(props: CategoryListClientProps) {
  return (
    <Suspense fallback={null}>
      <CategoryListInner {...props} />
    </Suspense>
  );
}
