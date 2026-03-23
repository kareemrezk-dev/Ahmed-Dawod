import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { getProductImagePath, getProductImageAlt, getProductName, getProductModelNumber } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import styles from "./ProductCard.module.css";

/** Quick specs labels per locale */
const SPEC_LABELS: Record<Locale, { bore: string; outer: string; width: string }> = {
  ar: { bore: "ق.داخلي", outer: "ق.خارجي", width: "العرض" },
  en: { bore: "Bore", outer: "OD", width: "Width" },
};

/** Pick first 3 spec values for quick display */
function QuickSpecs({ specs, locale }: { specs: Product["specs"]; locale: Locale }) {
  const labels = SPEC_LABELS[locale] ?? SPEC_LABELS.en;
  const keys = ["Bore Diameter", "Outer Diameter", "Width"];
  const matched = keys
    .map((k) => specs.find((s) => s.labelEn === k))
    .filter(Boolean) as Product["specs"];
  if (!matched.length) return null;
  const labelMap: Record<string, string> = {
    "Bore Diameter": labels.bore,
    "Outer Diameter": labels.outer,
    "Width": labels.width,
  };
  return (
    <div className={styles.quickSpecs}>
      {matched.map((spec) => (
        <div key={spec.labelEn} className={styles.quickSpecRow}>
          <span className={styles.quickSpecKey}>{labelMap[spec.labelEn] ?? spec.labelEn}:</span>
          <span className={styles.quickSpecSep}>·</span>
          <span className={styles.quickSpecValue}>{spec.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductCard({
  product, locale, animationDelay = 0, whatsapp,
}: {
  product: Product; locale: Locale; animationDelay?: number; whatsapp: string;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const name = getProductName(product, locale);
  const model = getProductModelNumber(product, locale);
  const imageSrc = getProductImagePath(product);
  const imageAlt = getProductImageAlt(product);

  const waMsg =
    locale === "ar" ? `السلام عليكم، أرغب في الاستفسار عن: ${model}` :
    `Hello, I'd like to inquire about: ${model}`;
  const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`;

  const viewLabel = locale === "ar" ? "عرض التفاصيل" : "View Details";
  const waLabel   = locale === "ar" ? "واتساب" : "WhatsApp";

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${animationDelay}ms` } as React.CSSProperties}
    >
      {/* ── Image area: 240px height ── */}
      <Link href={`/${locale}/products/${product.slug}`} className={styles.imageArea}
        tabIndex={-1} aria-hidden="true">
        <div className={styles.imageBox}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={400} height={400}
            className={styles.productImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageSrc.endsWith(".svg")}
          />
        </div>
        <span className={styles.brandTag}>{product.brand}</span>
        {product.featured && (
          <span className={styles.featuredBadge}>
            {locale === "ar" ? "مميز" : "Featured"}
          </span>
        )}
      </Link>

      {/* ── Text area: ~45% ── */}
      <div className={styles.textArea}>
        {name.toLowerCase() !== model.toLowerCase() && (
          <span className={styles.modelNumber}>{model}</span>
        )}
        <Link href={`/${locale}/products/${product.slug}`} className={styles.productName}>
          {name}
        </Link>
        <QuickSpecs specs={product.specs} locale={locale} />
        <Link href={`/${locale}/products/${product.slug}`} className={styles.detailsBtn}>
          {viewLabel}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
            style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }}>
            <path d="M1.5 6h9M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          {waLabel}
        </a>
      </div>
    </div>
  );
}
