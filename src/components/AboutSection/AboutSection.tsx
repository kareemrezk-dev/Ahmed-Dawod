import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./AboutSection.module.css";

interface AboutSectionProps { locale: Locale; dict: Dictionary; }

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.checkIcon}>
      <circle cx="8" cy="8" r="7" stroke="#1d4ed8" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndustrialGraphic() {
  return (
    <svg className={styles.graphic} width="480" height="400" viewBox="0 0 480 400" fill="none" aria-hidden="true">
      <circle cx="240" cy="200" r="170" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.12" />
      <circle cx="240" cy="200" r="155" stroke="#1d4ed8" strokeWidth="1" opacity="0.08" strokeDasharray="8 8" />
      <circle cx="240" cy="200" r="130" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.30" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * 2 * Math.PI;
        return <circle key={i} cx={240 + 115 * Math.cos(a)} cy={200 + 115 * Math.sin(a)} r="9" fill="#1d4ed8" opacity="0.25" />;
      })}
      <circle cx="240" cy="200" r="90" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.22" />
      <circle cx="240" cy="200" r="55" stroke="#1d4ed8" strokeWidth="2" opacity="0.28" />
      <circle cx="240" cy="200" r="30" fill="rgba(29,78,216,0.04)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.35" />
      <line x1="200" y1="200" x2="280" y2="200" stroke="#1d4ed8" strokeWidth="1" opacity="0.2" />
      <line x1="240" y1="160" x2="240" y2="240" stroke="#1d4ed8" strokeWidth="1" opacity="0.2" />
      <circle cx="240" cy="200" r="5" fill="#1d4ed8" opacity="0.6" />
      <circle cx="60" cy="80" r="40" stroke="#1d4ed8" strokeWidth="1" opacity="0.18" />
      {[0,1,2,3,4,5].map((i) => {
        const a = (i / 6) * 2 * Math.PI;
        return <circle key={i} cx={60 + 30 * Math.cos(a)} cy={80 + 30 * Math.sin(a)} r="4" fill="#1d4ed8" opacity="0.18" />;
      })}
      <circle cx="420" cy="320" r="45" stroke="#1d4ed8" strokeWidth="1" opacity="0.16" />
      {[0,1,2,3,4,5,6,7].map((i) => {
        const a = (i / 8) * 2 * Math.PI;
        return <circle key={i} cx={420 + 34 * Math.cos(a)} cy={320 + 34 * Math.sin(a)} r="4.5" fill="#1d4ed8" opacity="0.16" />;
      })}
    </svg>
  );
}

/* ── Per-locale About copy — spec-exact ── */
const ABOUT_COPY = {
  ar: {
    eyebrow: "من نحن",
    title: "أحمد داود لتجارة رولمان البلي",
    paragraphs: [
      "نحن متخصصون في استيراد وتوريد جميع أنواع ومقاسات رولمان البلي الأصلي وقطع غيار ماكينات المصانع من أفضل الماركات العالمية.",
      "منذ عام 2015 نعمل على تلبية احتياجات المصانع والورش والشركات الصناعية في السوق المصري والعربي من خلال توفير منتجات عالية الجودة تناسب مختلف التطبيقات الصناعية.",
      "نحرص دائمًا على توفير المنتجات الأصلية بأسعار مناسبة مع تقديم خدمة سريعة وموثوقة.",
    ],
    cta: "تواصل معنا",
  },
  en: {
    eyebrow: "About Us",
    title: "Ahmed Dawod Bearings",
    paragraphs: [
      "Ahmed Dawod Bearings specializes in supplying original industrial bearings and machine spare parts from leading global brands.",
      "Since 2015, we have been serving factories and industrial companies across the Egyptian and Arab markets.",
    ],
    cta: "Contact Us",
  },
  cn: {
    eyebrow: "关于我们",
    title: "Ahmed Dawod Bearings",
    paragraphs: [
      "Ahmed Dawod Bearings 为埃及及阿拉伯市场提供工业轴承和机械备件。",
    ],
    cta: "联系我们",
  },
} as const;

const FEATURES = {
  ar: [
    "خبرة تزيد عن 10 أعوام في سوق الرولمان المصري",
    "جميع المنتجات أصلية 100% بضمان الجودة",
    "توافر جميع الماركات العالمية الكبرى",
    "9 فئات منتجات تغطي جميع الاحتياجات الصناعية",
    "توصيل سريع وخدمة ما بعد البيع",
    "استشارات فنية متخصصة مجانية",
  ],
  en: [
    "Over 10 years of expertise in the Egyptian bearings market",
    "All products 100% genuine with quality guarantee",
    "All major international brands available",
    "9 product categories covering all industrial needs",
    "Fast delivery and after-sales service",
    "Free specialized technical consultations",
  ],
  cn: [
    "在埃及轴承市场拥有超过10年专业经验",
    "所有产品100%正品，质量有保障",
    "所有主要国际品牌均有现货",
    "9个产品类别，满足所有工业需求",
    "快速交货和售后服务",
    "免费专业技术咨询",
  ],
} as const;

export function AboutSection({ locale, dict }: AboutSectionProps) {
  const copy = ABOUT_COPY[locale] ?? ABOUT_COPY.en;
  const features = FEATURES[locale] ?? FEATURES.en;

  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <div className={styles.container}>
        {/* Visual side — no stats */}
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.graphicWrap} style={{ position: "relative", width: "100%", height: "100%", minHeight: 350, overflow: "hidden", borderRadius: 16 }}>
            <Image 
              src="/images/about-store.jpg"
              alt="أحمد داود لتجارة رولمان البلي"
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>
        </div>

        {/* Content side */}
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowRule} />
            <span className={styles.eyebrowText}>{copy.eyebrow}</span>
          </div>

          <h2 className={styles.title} id="about-heading">{copy.title}</h2>

          <div className={styles.bodyBlock}>
            {copy.paragraphs.map((p, i) => (
              <p key={i} className={styles.body}>{p}</p>
            ))}
          </div>

          {/* Feature checklist */}
          <ul className={styles.features} aria-label="Key features">
            {features.map((f, i) => (
              <li key={i} className={styles.featureItem}>
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link href={`/${locale}/contact`} className={styles.cta}>
            {copy.cta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              style={{ transform: locale === "ar" ? "scaleX(-1)" : "none" }}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
