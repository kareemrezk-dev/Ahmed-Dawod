import Link from "next/link";
import { getAllTopCategories, topCategoryLabels, type TopCategory } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import styles from "./TopCategoriesNav.module.css";

interface Props {
  locale: Locale;
  activeTopCat?: TopCategory | null;
}

function CategoryIcon({ cat }: { cat: TopCategory }) {
  // Simple geometric SVGs representing the industrial categories
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {cat === "bearings" && <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></>}
      {cat === "linear" && <><rect x="3" y="10" width="18" height="4" rx="1" /><line x1="6" y1="14" x2="6" y2="18" /><line x1="18" y1="14" x2="18" y2="18" /></>}
      {cat === "ball-screw" && <><line x1="3" y1="12" x2="21" y2="12" /><path d="M6 9l2 6 2-6 2 6 2-6 2 6 2-6" opacity="0.5" /></>}
      {cat === "hard-chrome" && <><rect x="4" y="6" width="16" height="12" rx="2" /><line x1="4" y1="12" x2="20" y2="12" strokeWidth="4" /></>}
      {cat === "lead-screw" && <><line x1="4" y1="12" x2="20" y2="12" /><path d="M5 8v8M9 8v8M13 8v8M17 8v8" /></>}
      {cat === "fasteners" && <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></>}
      {cat === "housings" && <><path d="M3 18h18v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" /><circle cx="12" cy="12" r="3" /></>}
      {cat === "pulleys" && <><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /><path d="M8 8h8M8 16h8" /></>}
      {cat === "misc" && <><circle cx="6" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="18" cy="12" r="2" /></>}
    </svg>
  );
}

export function TopCategoriesNav({ locale, activeTopCat }: Props) {
  const topCategories = getAllTopCategories() as TopCategory[];

  return (
    <nav className={styles.navContainer} aria-label="Top Categories">
      {topCategories.map((cat) => {
        const isCurrent = cat === activeTopCat;
        const labels = topCategoryLabels[cat];
        const name = locale === "ar" ? labels.ar : labels.en;
        return (
          <Link
            key={cat}
            href={`/${locale}/products/${cat}`}
            className={`${styles.categoryBox} ${isCurrent ? styles.activeBox : ""}`}
            aria-current={isCurrent ? "page" : undefined}
          >
            <div className={styles.iconCircle}>
              <CategoryIcon cat={cat} />
            </div>
            <span className={styles.boxLabel}>{name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
