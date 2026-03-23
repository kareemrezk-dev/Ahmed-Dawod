import Link from "next/link";
import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import styles from "./not-found.module.css";

const COPY = {
  ar: {
    code: "٤٠٤",
    title: "الصفحة غير موجودة",
    subtitle: "يبدو أن هذه الصفحة لا وجود لها، أو ربما تم نقلها.",
    back: "العودة للرئيسية",
    products: "تصفح المنتجات",
    contact: "تواصل معنا",
    hint: "جرّب البحث عن رقم الموديل أو اسم المنتج الذي تبحث عنه.",
  },
  en: {
    code: "404",
    title: "Page Not Found",
    subtitle: "This page doesn't exist or may have been moved.",
    back: "Back to Home",
    products: "Browse Products",
    contact: "Contact Us",
    hint: "Try searching for the model number or product name you're looking for.",
  },
} as const;

export default function LocaleNotFound() {
  // Extract locale from the request URL since not-found doesn't receive params
  const headersList = headers();
  const referer = headersList.get("x-next-url") ?? headersList.get("referer") ?? "";
  const pathSegments = new URL(referer, "https://ahmeddawod.com").pathname.split("/");
  const detected = pathSegments[1] as Locale;
  const locale: Locale = locales.includes(detected) ? detected : "ar";
  const c = COPY[locale] ?? COPY.ar;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className={styles.page} dir={dir}>
      {/* Decorative bearing rings */}
      <div className={styles.bgRings} aria-hidden="true">
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.ring3} />
      </div>

      <div className={styles.inner}>
        <div className={styles.codeWrap} aria-hidden="true">
          <span className={styles.code}>{c.code}</span>
          {/* Mini bearing SVG in the zero */}
          <svg className={styles.bearingSvg} viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="40" cy="40" r="34" stroke="#1d4ed8" strokeWidth="8" opacity="0.12" />
            <circle cx="40" cy="40" r="34" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
            <circle cx="40" cy="40" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * 2 * Math.PI;
              return <circle key={i} cx={40 + 22 * Math.cos(a)} cy={40 + 22 * Math.sin(a)} r="5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />;
            })}
            <circle cx="40" cy="40" r="10" stroke="#1d4ed8" strokeWidth="2" fill="#eff6ff" />
            <circle cx="40" cy="40" r="3" fill="#1d4ed8" opacity="0.6" />
          </svg>
        </div>

        <div className={styles.rule} aria-hidden="true" />
        <h1 className={styles.title}>{c.title}</h1>
        <p className={styles.subtitle}>{c.subtitle}</p>
        <p className={styles.hint}>{c.hint}</p>

        <div className={styles.actions}>
          <Link href={`/${locale}`} className={styles.btnPrimary}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"
              style={{ transform: locale !== "ar" ? "scaleX(-1)" : "none" }}>
              <path d="M9.5 3L5.5 7.5L9.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {c.back}
          </Link>
          <Link href={`/${locale}/products`} className={styles.btnSecondary}>{c.products}</Link>
          <Link href={`/${locale}/contact`} className={styles.btnGhost}>{c.contact}</Link>
        </div>
      </div>
    </div>
  );
}
