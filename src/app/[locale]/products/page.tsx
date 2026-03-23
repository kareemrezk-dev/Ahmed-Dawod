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
  type CategoryName,
} from "@/lib/products";
import { getDictionary } from "@/lib/getDictionary";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import styles from "./page.module.css";
import { TopCategoriesNav } from "@/components/TopCategoriesNav/TopCategoriesNav";
import { ProductsClient } from "./ProductsClient";
import { FAQ } from "@/components/FAQ/FAQ";

const PAGE_SIZE = 12;

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

  const allProducts = getAllProducts();
  const allCategories = getAllCategories();
  const allBrands = getAllBrands();

  const searchParamsObj = searchParams || {};
  const rawCategoryString = searchParamsObj.category;
  const rawCategory = Array.isArray(rawCategoryString) ? rawCategoryString[0] : rawCategoryString;
  const rawBrandString = searchParamsObj.brand;
  const rawBrand = Array.isArray(rawBrandString) ? rawBrandString[0] : rawBrandString;
  const rawSizeString = searchParamsObj.size;
  const rawSize = Array.isArray(rawSizeString) ? rawSizeString[0] : rawSizeString;
  
  const pageString = searchParamsObj.page;
  const pageVal = Array.isArray(pageString) ? pageString[0] : pageString;
  const currentPage = Math.max(1, parseInt(pageVal ?? "1", 10));

  const activeCategory: CategoryName | null =
    rawCategory && (allCategories as string[]).includes(rawCategory)
      ? (rawCategory as CategoryName)
      : null;

  const activeBrand: string | null =
    rawBrand && allBrands.map((b) => b.toLowerCase()).includes(rawBrand.toLowerCase())
      ? allBrands.find((b) => b.toLowerCase() === rawBrand.toLowerCase()) ?? null
      : null;

  let filtered = allProducts;
  if (activeCategory) filtered = filtered.filter((p) => p.category === activeCategory);
  if (activeBrand) filtered = filtered.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());
  if (rawSize) filtered = filtered.filter((p) => p.sizes?.some((s) => s.toLowerCase().includes(rawSize.toLowerCase())));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
          />
        </Suspense>

        <FAQ title={dict.faq.title} items={dict.faq.items} />
      </div>
    </div>
  );
}
