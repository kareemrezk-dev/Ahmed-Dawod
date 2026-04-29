import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import {
  getAllCategories,
  getAllBrands,
  getCategoryLabel,
  type CategoryName,
} from "@/lib/products";
import { getProductsPaginated } from "@/lib/products.server";
import { getDictionary } from "@/lib/getDictionary";
import { getPricingOverrides } from "@/lib/pricing.server";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import styles from "./page.module.css";
import { TopCategoriesNav } from "@/components/TopCategoriesNav/TopCategoriesNav";
import { ProductsClient } from "./ProductsClient";
import { FAQ } from "@/components/FAQ/FAQ";

export const revalidate = 60;

const PAGE_SIZE = 24;

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
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

  const allCategories = getAllCategories();
  const allBrands = getAllBrands();

  const searchParamsObj = searchParams || {};
  const rawQuery = firstParam(searchParamsObj.q)?.trim() || null;
  const rawCategory = firstParam(searchParamsObj.subcategory) ?? firstParam(searchParamsObj.category);
  const rawBrand = firstParam(searchParamsObj.brand);
  
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

  // Server-side pagination from Supabase
  const { products: paginatedProducts, total: resultsCount, totalPages } = await getProductsPaginated(
    currentPage,
    PAGE_SIZE,
    {
      search: rawQuery || undefined,
      category: activeCategory || undefined,
      brand: activeBrand || undefined,
    }
  );

  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  // Category/brand options for filters (lightweight — just names, no counts from full scan)
  const categoryOptions = allCategories.map((cat) => ({
    value: cat,
    label: getCategoryLabel(cat, locale),
    count: 0,
  }));

  const brandOptions = allBrands.map((brand) => ({
    value: brand,
    label: brand,
    count: 0,
  }));

  const sizeOptions: { value: string; label: string; count: number }[] = [];

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
            activeSize={null}
            pricingOverrides={pricingOverrides}
          />
        </Suspense>

        <FAQ title={dict.faq.title} items={dict.faq.items} />
      </div>
    </div>
  );
}
