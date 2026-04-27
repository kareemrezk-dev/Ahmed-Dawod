import Link from "next/link";
import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import styles from "./not-found.module.css";

const COPY = {
  ar: {
    code: "404",
    title: "الصفحة غير موجودة",
    subtitle: "عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.",
    description: "قد تكون الصفحة قد حُذفت أو نُقلت إلى عنوان آخر، أو ربما يوجد خطأ في الرابط.",
    back: "العودة للرئيسية",
    products: "تصفح المنتجات",
    contact: "تواصل معنا",
    searchPlaceholder: "ابحث عن رقم الموديل أو اسم المنتج...",
    quickLinks: "روابط سريعة",
    linkBall: "بلي",
    linkLinear: "لينر",
    linkBallScrew: "بول سكرو",
  },
  en: {
    code: "404",
    title: "Page Not Found",
    subtitle: "Sorry, we couldn't find the page you're looking for.",
    description: "The page may have been deleted, moved to a new URL, or the link might contain an error.",
    back: "Back to Home",
    products: "Browse Products",
    contact: "Contact Us",
    searchPlaceholder: "Search for model number or product name...",
    quickLinks: "Quick Links",
    linkBall: "Ball Bearings",
    linkLinear: "Linear",
    linkBallScrew: "Ball Screw",
  },
} as const;

export default function LocaleNotFound() {
  // Extract locale from the request URL since not-found doesn't receive params
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("x-next-url") ?? headersList.get("referer") ?? "";
  
  // Try to extract locale from pathname first, then from full URL
  let detected: string = "ar";
  if (pathname.startsWith("/en/") || pathname === "/en") {
    detected = "en";
  } else if (pathname.startsWith("/ar/") || pathname === "/ar") {
    detected = "ar";
  } else {
    // Try parsing as URL for referer header
    try {
      const segments = new URL(pathname, "https://ahmeddawod.com").pathname.split("/");
      if (locales.includes(segments[1] as Locale)) {
        detected = segments[1];
      }
    } catch { /* fallback to ar */ }
  }
  
  const locale = detected as Locale;
  const c = COPY[locale] ?? COPY.ar;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className={styles.page} dir={dir}>
      {/* Decorative background elements */}
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.gridPattern} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.floatingBearing1}>
          <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="2" opacity="0.15" />
            <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.1" />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * 2 * Math.PI;
              return <circle key={i} cx={40 + 22 * Math.cos(a)} cy={40 + 22 * Math.sin(a)} r="4" fill="currentColor" opacity="0.08" />;
            })}
            <circle cx="40" cy="40" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.12" />
          </svg>
        </div>
        <div className={styles.floatingBearing2}>
          <svg viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="2" opacity="0.1" />
            <circle cx="30" cy="30" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.08" />
            <circle cx="30" cy="30" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
          </svg>
        </div>
      </div>

      <div className={styles.container}>
        {/* Main 404 Hero */}
        <div className={styles.heroSection}>
          <div className={styles.errorCode} aria-hidden="true">
            <span className={styles.digit}>4</span>
            <div className={styles.zeroWrap}>
              <span className={styles.digit}>0</span>
              <svg className={styles.bearingInset} viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="var(--color-primary)" strokeWidth="6" opacity="0.15" />
                <circle cx="50" cy="50" r="42" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
                <circle cx="50" cy="50" r="28" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
                {Array.from({ length: 7 }).map((_, i) => {
                  const a = (i / 7) * 2 * Math.PI;
                  return (
                    <circle
                      key={i}
                      cx={50 + 28 * Math.cos(a)}
                      cy={50 + 28 * Math.sin(a)}
                      r="6"
                      fill="#dbeafe"
                      stroke="var(--color-primary)"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="14" stroke="var(--color-primary)" strokeWidth="2" fill="#eff6ff" opacity="0.9" />
                <circle cx="50" cy="50" r="5" fill="var(--color-primary)" opacity="0.5" />
              </svg>
            </div>
            <span className={styles.digit}>4</span>
          </div>

          <div className={styles.divider} aria-hidden="true" />

          <h1 className={styles.title}>{c.title}</h1>
          <p className={styles.subtitle}>{c.subtitle}</p>
          <p className={styles.description}>{c.description}</p>
        </div>

        {/* Search Box */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <Link href={`/${locale}/products`} className={styles.searchLink}>
              {c.searchPlaceholder}
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Link href={`/${locale}`} className={styles.btnPrimary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: locale !== "ar" ? "scaleX(-1)" : "none" }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {c.back}
          </Link>
          <Link href={`/${locale}/products`} className={styles.btnAccent}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            {c.products}
          </Link>
          <Link href={`/${locale}/contact`} className={styles.btnOutline}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {c.contact}
          </Link>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinksSection}>
          <span className={styles.quickLinksLabel}>{c.quickLinks}</span>
          <div className={styles.quickLinks}>
            <Link href={`/${locale}/products/bearings`} className={styles.quickLink}>{c.linkBall}</Link>
            <span className={styles.linkDot}>·</span>
            <Link href={`/${locale}/products/linear`} className={styles.quickLink}>{c.linkLinear}</Link>
            <span className={styles.linkDot}>·</span>
            <Link href={`/${locale}/products/ball-screw`} className={styles.quickLink}>{c.linkBallScrew}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
