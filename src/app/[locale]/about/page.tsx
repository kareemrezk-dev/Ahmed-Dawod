import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import Link from "next/link";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const title = params.locale === "ar" ? "من نحن" : "About Us";
  return generateLocaleMetadata(params.locale, title);
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.checkIcon}>
      <circle cx="8" cy="8" r="7" stroke="#1d4ed8" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COPY = {
  ar: {
    eyebrow: "من نحن",
    title: "أحمد داود لتجارة رولمان البلي",
    subtitle: "خبرة تزيد عن 10 أعوام في توريد رولمان البلي وقطع غيار الماكينات الصناعية",
    paragraphs: [
      "نحن متخصصون في استيراد وتوريد جميع أنواع ومقاسات رولمان البلي الأصلي وقطع غيار ماكينات المصانع من أفضل الماركات العالمية.",
      "منذ عام 2015 نعمل على تلبية احتياجات المصانع والورش والشركات الصناعية في السوق المصري والعربي من خلال توفير منتجات عالية الجودة تناسب مختلف التطبيقات الصناعية.",
      "نحرص دائمًا على توفير المنتجات الأصلية بأسعار مناسبة مع تقديم خدمة سريعة وموثوقة ومتابعة كاملة لعملائنا قبل وبعد البيع.",
    ],
    features: [
      "خبرة تزيد عن 10 أعوام في سوق الرولمان المصري",
      "جميع المنتجات أصلية 100% بضمان الجودة",
      "توافر جميع الماركات العالمية الكبرى",
      "9 فئات منتجات تغطي جميع الاحتياجات الصناعية",
      "توصيل سريع وخدمة ما بعد البيع",
      "استشارات فنية متخصصة مجانية",
    ],
    stats: [
      { number: "10+", label: "سنة خبرة" },
      { number: "500+", label: "عميل راضٍ" },
      { number: "9", label: "فئة منتجات" },
      { number: "6+", label: "ماركة عالمية" },
    ],
    cta: "تواصل معنا",
    breadcrumb: "من نحن",
  },
  en: {
    eyebrow: "About Us",
    title: "Ahmed Dawod Bearings",
    subtitle: "Over 10 years of expertise in supplying genuine bearings and industrial machine spare parts",
    paragraphs: [
      "Ahmed Dawod Bearings specializes in importing and supplying all types and sizes of genuine ball bearings and factory machinery spare parts from the world's leading global brands.",
      "Since 2015, we have been serving factories, workshops, and industrial companies across the Egyptian and Arab markets with high-quality products suited to a wide range of industrial applications.",
      "We are committed to providing 100% original products at competitive prices, backed by fast, reliable service and complete customer support before and after every sale.",
    ],
    features: [
      "Over 10 years of expertise in the Egyptian bearings market",
      "All products 100% genuine with quality guarantee",
      "All major international brands available",
      "9 product categories covering all industrial needs",
      "Fast delivery and after-sales service",
      "Free specialized technical consultations",
    ],
    stats: [
      { number: "10+", label: "Years of experience" },
      { number: "500+", label: "Satisfied clients" },
      { number: "9", label: "Product categories" },
      { number: "6+", label: "Global brands" },
    ],
    cta: "Contact Us",
    breadcrumb: "About",
  },
} as const;

export default async function AboutPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  const copy = COPY[locale] ?? COPY.en;

  const breadcrumbItems = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: copy.breadcrumb },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={breadcrumbItems} locale={locale} />
          </div>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            <span className={styles.eyebrowText}>{copy.eyebrow}</span>
          </div>
          <h1 className={styles.pageTitle}>{copy.title}</h1>
          <p className={styles.pageSubtitle}>{copy.subtitle}</p>
        </header>

        {/* Stats row */}
        <div className={styles.statsRow}>
          {copy.stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.textCol}>
            {copy.paragraphs.map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))}
            <Link href={`/${locale}/contact`} className={styles.cta}>
              {copy.cta}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                style={{ transform: locale === "ar" ? "scaleX(-1)" : "none" }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className={styles.featuresCol}>
            <ul className={styles.featuresList} aria-label="Key features">
              {copy.features.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
