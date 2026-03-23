import type { Locale } from "@/lib/i18n";
import type { TopCategory } from "@/lib/products";
import { categoryDescriptions, topCategoryLabels } from "@/lib/products";
import styles from "./CategoryIntro.module.css";

interface CategoryIntroProps {
  locale: Locale;
  topCat: TopCategory;
}

export function CategoryIntro({ locale, topCat }: CategoryIntroProps) {
  const desc = categoryDescriptions[topCat];
  if (!desc) return null;

  const paragraphs = locale === "ar" ? desc.ar : desc.en;
  const labels = topCategoryLabels[topCat];
  const categoryLabel = locale === "ar" ? labels.ar : labels.en;

  return (
    <div className={styles.intro}>
      <div className={styles.inner}>
        {/* Accent bar + category label */}
        <div className={styles.labelRow}>
          <span className={styles.accentBar} aria-hidden="true" />
          <span className={styles.categoryLabel}>{categoryLabel}</span>
        </div>
        {/* Description paragraphs */}
        <div className={styles.paragraphs}>
          {paragraphs.map((p, i) => (
            <p key={i} className={styles.para}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
