import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./Hero.module.css";

// Removed SVG illustration in favor of the new background image

interface HeroProps { locale: Locale; dict: Dictionary; }

export function Hero({ locale, dict }: HeroProps) {
  const slide = dict.hero.slides[0];

  return (
    <section className={styles.hero} aria-label={dict.company.name}>
      {/* Background Image Setup */}
      <div className={styles.bgWrapper}>
        <Image
          src="/images/hero-bg.png"
          alt="Industrial Bearings Background"
          fill
          priority
          quality={75}
          sizes="100vw"
          className={styles.bgImage}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsM"
        />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        {/* Text column - Now centered for the hero image */}
        <div className={styles.textCol}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <span className={styles.eyebrowText}>{slide.eyebrow}</span>
          </div>
          <h1 className={styles.title}>{dict.company.name}</h1>
          <p className={styles.subtitle}>{dict.company.slogan}</p>
          <p className={styles.description}>{slide.body}</p>
          <div className={styles.ctaRow}>
            <Link href={`/${locale}/products`} className={styles.ctaPrimary}>
              <span>{slide.cta}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaIcon} aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
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
