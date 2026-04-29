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
          src="/images/hero-bg.webp"
          alt="Industrial Bearings Background"
          fill
          priority
          quality={85}
          sizes="100vw"
          className={styles.bgImage}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsM"
        />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        {/* Content wrapper for two-column layout */}
        <div className={styles.contentGrid}>
          {/* Text column */}
          <div className={styles.textCol}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              <span className={styles.eyebrowText}>{slide.eyebrow}</span>
            </div>
            <h1 className={styles.title}>
              <span className={styles.titleGradient}>{dict.company.name}</span>
            </h1>
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
              <Link href={`/${locale}/contact`} className={styles.ctaSecondary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginInlineEnd: 8}}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {dict.nav.contact}
              </Link>
            </div>

            <div className={styles.trustWrapper}>
              <p className={styles.trustLabel}>وكيل معتمد وموزع لأكبر الماركات العالمية:</p>
              <div className={styles.trustRow} aria-label="Trusted brands">
                {["SKF", "NSK", "NTN", "FAG", "TIMKEN"].map((b) => (
                  <span key={b} className={styles.trustBadge}>{b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Glassmorphism Feature Card */}
          <div className={styles.visualCol}>
            <div className={styles.glassCard}>
              <div className={styles.glassHeader}>
                <div className={styles.pulseDot}></div>
                <span>جاهزون لتلبية احتياجات مصنعك</span>
              </div>
              <div className={styles.glassFeatures}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className={styles.featureText}>
                    <h4>منتجات أصلية 100%</h4>
                    <p>بضمان الوكيل المعتمد</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div className={styles.featureText}>
                    <h4>دعم فني هندسي</h4>
                    <p>استشارات لحل مشاكل التآكل</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </div>
                  <div className={styles.featureText}>
                    <h4>شحن سريع</h4>
                    <p>توصيل لجميع المناطق الصناعية</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className={styles.glowCircle1}></div>
            <div className={styles.glowCircle2}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
