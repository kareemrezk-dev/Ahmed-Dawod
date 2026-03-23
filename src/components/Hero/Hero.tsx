import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./Hero.module.css";

function BearingIllustration() {
  return (
    <svg viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={styles.illustration} aria-hidden="true">
      <circle cx="240" cy="240" r="215" fill="#dbeafe" opacity="0.45" />
      <circle cx="240" cy="240" r="205" stroke="#1d4ed8" strokeWidth="24" fill="none" opacity="0.10" />
      <circle cx="240" cy="240" r="205" stroke="#1d4ed8" strokeWidth="4" fill="none" opacity="0.55" />
      <circle cx="240" cy="240" r="168" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="10 7" opacity="0.65" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        return (
          <circle key={i}
            cx={240 + 168 * Math.cos(a)} cy={240 + 168 * Math.sin(a)}
            r="21" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2.5" />
        );
      })}
      <circle cx="240" cy="240" r="118" stroke="#1d4ed8" strokeWidth="20" fill="none" opacity="0.10" />
      <circle cx="240" cy="240" r="118" stroke="#1d4ed8" strokeWidth="3.5" fill="none" opacity="0.6" />
      <circle cx="240" cy="240" r="58" fill="#eff6ff" stroke="#1d4ed8" strokeWidth="3.5" />
      <line x1="204" y1="240" x2="276" y2="240" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.4" />
      <line x1="240" y1="204" x2="240" y2="276" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.4" />
      <circle cx="240" cy="240" r="10" fill="#1d4ed8" opacity="0.7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * 2 * Math.PI;
        return (
          <line key={i}
            x1={240 + 226 * Math.cos(a)} y1={240 + 226 * Math.sin(a)}
            x2={240 + 240 * Math.cos(a)} y2={240 + 240 * Math.sin(a)}
            stroke="#1d4ed8" strokeWidth="2" opacity="0.2" />
        );
      })}
    </svg>
  );
}

interface HeroProps { locale: Locale; dict: Dictionary; }

export function Hero({ locale, dict }: HeroProps) {
  const slide = dict.hero.slides[0];

  return (
    <section className={styles.hero} aria-label={dict.company.name}>
      <div className={styles.container}>
        {/* Illustration column */}
        <div className={styles.imageCol}>
          <div className={styles.sinceBadge}>{dict.sinceBadge}</div>
          <div className={styles.illustrationWrap}>
            <Image
              src="/images/hero-cinematic.png"
              alt={dict.company.name}
              fill
              unoptimized
              style={{ objectFit: "cover", objectPosition: "center center" }}
            />
          </div>
          <div className={styles.floatingBadge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            <span>{dict.genuine}</span>
          </div>
        </div>

        {/* Text column */}
        <div className={styles.textCol}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <span className={styles.eyebrowText}>{slide.eyebrow}</span>
          </div>
          <h1 className={styles.title}>{dict.company.name}</h1>
          <p className={styles.subtitle}>{dict.company.slogan}</p>
          <p className={styles.description}>{slide.body}</p>
          <div className={styles.ctaRow}>
            <Link href={`/${locale}/products`} className={styles.ctaPrimary}>{slide.cta}</Link>
            <Link href={`/${locale}/contact`} className={styles.ctaSecondary}>{dict.nav.contact}</Link>
          </div>
          <div className={styles.trustRow} aria-label="Trusted brands">
            {["SKF", "NSK", "NTN", "FAG", "TIMKEN"].map((b) => (
              <span key={b} className={styles.trustBadge}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
