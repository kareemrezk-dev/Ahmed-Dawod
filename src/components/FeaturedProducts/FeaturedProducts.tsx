import React from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { getFeaturedProducts, shuffleProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

interface FeaturedProductsProps {
  locale: Locale;
  dict: Dictionary;
}

function ArrowIcon({ dir }: { dir: string }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none", flexShrink: 0 }}
    >
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeaturedProducts({ locale, dict }: FeaturedProductsProps) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  // Server-side shuffle on every request — guaranteed no duplicates
  const featured = shuffleProducts(getFeaturedProducts()).slice(0, 8);
  const sectionEyebrow = locale === "ar" ? "منتجات مختارة" : "Featured";
  const viewAllLabel = locale === "ar" ? "عرض كل المنتجات" : "View All Products";

  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowRule} />
            <span className={styles.eyebrowText}>{sectionEyebrow}</span>
          </div>
          <div className={styles.headerRow}>
            <h2 className={styles.title} id="featured-heading">
              {locale === "ar" ? "منتجات مميزة" : "Featured Products"}
            </h2>
            <Link href={`/${locale}/products`} className={styles.viewAll}>
              {viewAllLabel}
              <ArrowIcon dir={dir} />
            </Link>
          </div>
        </header>

        <div className={styles.grid}>
          {featured.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale}
              animationDelay={i * 40}
              whatsapp={dict.company.whatsappIntl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
