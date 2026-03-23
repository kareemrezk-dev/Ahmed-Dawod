import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import {
  getAllProducts,
  getAllCategories,
  getAllBrands,
} from "@/lib/products";
import { getDictionary } from "@/lib/getDictionary";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import styles from "./page.module.css";
import { TopCategoriesNav } from "@/components/TopCategoriesNav/TopCategoriesNav";
import { ProductsClient } from "./ProductsClient";
import { FAQ } from "@/components/FAQ/FAQ";

interface PageProps {
  params: { locale: Locale };
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

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  const allProducts = getAllProducts();
  const allCategories = getAllCategories();
  const allBrands = getAllBrands();

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
            allProducts={allProducts}
            allCategories={allCategories}
            allBrands={allBrands}
          />
        </Suspense>

        <FAQ title={dict.faq.title} items={dict.faq.items} />
      </div>
    </div>
  );
}
