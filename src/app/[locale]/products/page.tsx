import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import {
  getAllProducts,
  getAllCategories,
  getAllBrands,
  getCategoryLabel,
  searchProducts,
  type CategoryName,
  type Product,
} from "@/lib/products";
import { getDictionary } from "@/lib/getDictionary";
import { getPricingOverrides } from "@/lib/pricing.server";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import styles from "./page.module.css";
import { TopCategoriesNav } from "@/components/TopCategoriesNav/TopCategoriesNav";
import { ProductsClient } from "./ProductsClient";
import { FAQ } from "@/components/FAQ/FAQ";

export const revalidate = 60;

const PAGE_SIZE = 12;

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function matchesSize(product: Product, size: string): boolean {
  const needle = size.toLowerCase();
  return product.sizes?.some((s) => s.toLowerCase().includes(needle)) ?? false;
}

function applyFilters(
  products: Product[],
  filters: { q: string | null; category: CategoryName | null; brand: string | null; size: string | null }
): Product[] {
  const searchMatches = filters.q ? new Set(searchProducts(filters.q).map((p) => p.slug)) : null;

  return products.filter((product) => {
    if (searchMatches && !searchMatches.has(product.slug)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.size && !matchesSize(product, filters.size)) return false;
    return true;
  });
}

interface PageProps {
  params: { locale: Locale };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generateLocaleMetadata(
    params.locale,
    params.locale === "ar" ? "المنتجات" : "Products"
  );
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  const pricingOverrides = await getPricingOverrides();

  const allProducts = getAllProducts();
  const allCategories = getAllCategories();
  const allBrands = getAllBrands();

  const searchParamsObj = searchParams || {};
  const rawQuery = firstParam(searchParamsObj.q)?.trim() || null;
  const rawCategory = firstParam(searchParamsObj.subcategory) ?? firstParam(searchParamsObj.category);
  const rawBrand = firstParam(searchParamsObj.brand);
  const rawSize = firstParam(searchParamsObj.size)?.trim() || null;
  
  const pageVal = firstParam(searchParamsObj.page);
  const currentPage = Math.max(1, parseInt(pageVal ?? "1", 10));

  const activeCategory: CategoryName | null =
    rawCategory && (allCategories as string[]).includes(rawCategory)
      ? (rawCategory as CategoryName)
      : null;

  const activeBrand: string | null =
    rawBrand && allBrands.map((b) => b.toLowerCase()).includes(rawBrand.toLowerCase())
      ? allBrands.find((b) => b.toLowerCase() === rawBrand.toLowerCase()) ?? null
      : null;

  const filters = { q: rawQuery, category: activeCategory, brand: activeBrand, size: rawSize };
  const filtered = applyFilters(allProducts, filters);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Optimized: compute each base set ONCE, not per-option ──
  const baseForCategory = applyFilters(allProducts, { ...filters, category: null });
  const categoryOptions = allCategories.map((cat) => ({
    value: cat,
    label: getCategoryLabel(cat, locale),
    count: baseForCategory.filter((p) => p.category === cat).length,
  })).filter((o) => o.count > 0);

  const baseForBrand = applyFilters(allProducts, { ...filters, brand: null });
  const brandOptions = allBrands.map((brand) => ({
    value: brand,
    label: brand,
    count: baseForBrand.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length,
  })).filter((o) => o.count > 0);

  const baseForSize = applyFilters(allProducts, { ...filters, size: null });
  const allSizes = [...new Set(baseForSize.flatMap((p) => p.sizes ?? []))].sort();
  const sizeOptions = allSizes.map((size) => ({
    value: size,
    label: size,
    count: baseForSize.filter((p) => p.sizes?.includes(size)).length,
  }));

  const resultsCount = filtered.length;

  // ── Labels ──
  const pageTitle = dict.products.title;
  const pageSubtitle = dict.products.subtitle;

  const breadcrumbItems = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: pageTitle },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Page header */}
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={breadcrumbItems} locale={locale} />
          </div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>{pageSubtitle}</p>
        </header>

        <TopCategoriesNav locale={locale} />

        <Suspense fallback={null}>
          <ProductsClient
            locale={locale}
            dict={dict}
            paginatedProducts={paginatedProducts}
            totalPages={totalPages}
            currentPage={safePage}
            resultsCount={resultsCount}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
            sizeOptions={sizeOptions}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activeSize={rawSize || null}
            pricingOverrides={pricingOverrides}
          />
        </Suspense>

        <FAQ title={dict.faq.title} items={dict.faq.items} />
      </div>
    </div>
  );
}
