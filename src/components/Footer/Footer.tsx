import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import styles from "./Footer.module.css";

function FacebookIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}
function InstagramIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function WhatsAppIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z" /></svg>;
}
function LocationIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function MailIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>;
}

export async function Footer({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);
  const year = new Date().getFullYear();

  const navLinks = [
    { href: `/${locale}`,          label: dict.nav.home },
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/about`,    label: dict.nav.about },
    { href: `/${locale}/contact`,  label: dict.nav.contact },
  ];

  const catLinks = dict.megaMenu.categories.slice(0, 6).map((cat) => ({
    href: `/${locale}/${cat.href}`,
    label: cat.label,
  }));

  const rightsLabel = locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved";

  return (
    <footer className={styles.footer}>
      <div className={styles.upper}>

        {/* Brand column — First structurally (natural left in LTR, right in RTL) */}
        <div className={styles.brandCol}>
          <div className={styles.footerLogo}>
            <Image
              src="/logo.svg"
              alt={dict.company.name}
              width={160}
              height={87}
              className={styles.footerLogoImg}
            />
            <span className={styles.footerSlogan}>{dict.company.slogan}</span>
            <span className={styles.footerEstablished}>{dict.company.established}</span>
          </div>
          <p className={styles.footerDesc}>{dict.marketing.tagline3}</p>
          <div className={styles.socialRow}>
            <a href={dict.company.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={dict.company.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={`https://wa.me/${dict.company.whatsappIntl.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        {/* Nav Links Wrapper — Always keeps Cats and Links side-by-side gracefully */}
        <div className={styles.navGrid}>
          {/* Quick links */}
          <nav className={styles.linksCol} aria-label={dict.footer.quickLinks}>
            <h3 className={styles.colHeading}>{dict.footer.quickLinks}</h3>
            <ul className={styles.linkList}>
              {navLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.footerLink}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          
          {/* Categories */}
          <nav className={styles.catsCol} aria-label={dict.megaMenu.title}>
            <h3 className={styles.colHeading}>{dict.megaMenu.title}</h3>
            <ul className={styles.linkList}>
              {catLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.footerLink}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contact column */}
        <address className={styles.contactCol} style={{ fontStyle: "normal" }}>
          <h3 className={styles.colHeading}>{dict.contact.title}</h3>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><PhoneIcon /></span>
            <a href={`tel:${dict.company.phoneIntl}`} className={styles.contactLink} dir="ltr">
              {dict.company.phone}
            </a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><WhatsAppIcon /></span>
            <a href={`https://wa.me/${dict.company.whatsappIntl.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink} dir="ltr">
              {dict.company.whatsapp}
            </a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><MailIcon /></span>
            <a href={`mailto:${dict.company.email}`} className={styles.contactLink}>
              {dict.company.email}
            </a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}><LocationIcon /></span>
            <span className={styles.contactText}>{dict.company.address}</span>
          </div>
        </address>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copyrightText}>
            {rightsLabel} {dict.company.name} {year}©.{" "}
            {locale === "ar" ? "تصميم وتطوير " : "Designed and developed by "}
            <a href="https://kareem-portfolio-lilac.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.devLink}>
              {locale === "ar" ? "كريم رزق" : "Kareem Rizk"}
            </a>
          </span>
          <span className={styles.bottomRight}>
            <span className={styles.badge}>{dict.genuine}</span>
            <span className={styles.bottomDot}>·</span>
            <span className={styles.badge}>{dict.company.country}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
