import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { getRelatedProducts, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import styles from "./RelatedProducts.module.css";

interface RelatedProductsProps {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}

export function RelatedProducts({ product, locale, dict }: RelatedProductsProps) {
  const related = getRelatedProducts(product, 4);
  if (related.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-heading">
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowRule} />
          <span className={styles.eyebrowText}>{dict.products.relatedTitle}</span>
        </div>
        <Link href={`/${locale}/products`} className={styles.viewAll}>
          {locale === "ar" ? "عرض الكل" : "View All"}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
            style={{ transform: locale === "ar" ? "scaleX(-1)" : "none" }}>
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <div className={styles.grid}>
        {related.map((p, i) => (
          <ProductCard key={p.slug} product={p} locale={locale} animationDelay={i * 60} whatsapp={dict.company.whatsappIntl} />
        ))}
      </div>
    </section>
  );
}
