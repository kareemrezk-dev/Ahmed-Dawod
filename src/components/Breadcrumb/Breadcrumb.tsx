import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem { label: string; href?: string; }

export function Breadcrumb({ items, locale }: { items: BreadcrumbItem[]; locale: string }) {
  const isRtl = locale === "ar";
  const Sep = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ transform: isRtl ? "scaleX(-1)" : "none", flexShrink: 0 }}>
      <path d="M3 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.breadcrumb}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {i > 0 && <span className={styles.separator}><Sep /></span>}
              {item.href && !isLast
                ? <Link href={item.href} className={styles.link}>{item.label}</Link>
                : <span className={isLast ? styles.current : styles.link} aria-current={isLast ? "page" : undefined}>{item.label}</span>
              }
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
