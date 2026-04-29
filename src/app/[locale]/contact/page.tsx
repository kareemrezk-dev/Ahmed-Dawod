import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import styles from "./page.module.css";

export async function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  return generateLocaleMetadata(params.locale, params.locale === "ar" ? "اتصل بنا" : "Contact Us");
}

function PhoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z" /></svg>; }
function WaIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>; }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>; }
function LocIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function FbIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>; }
function IgIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>; }

export default async function ContactPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";
  const pageTitle = dict.contact.title;
  const breadcrumbItems = [{ label: dict.nav.home, href: `/${locale}` }, { label: pageTitle }];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbItems} locale={locale} /></div>
          <div className={styles.eyebrow}><span className={styles.eyebrowRule} aria-hidden="true" /><span className={styles.eyebrowText}>{isAr ? "تواصل معنا" : "Get in touch"}</span></div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>{isAr ? "نحن هنا للإجابة على جميع استفساراتك وتلبية احتياجاتك من رولمان البلي الأصلي." : "We are here to answer all your inquiries and fulfill your genuine bearing needs."}</p>
        </header>
        <div className={styles.body}>
          <div className={styles.infoCol}>
            <div className={styles.contactCard}>
              <div className={styles.cardHeader}>
                <p className={styles.cardBrandName}>{dict.company.name}</p>
                <p className={styles.cardBrandSlogan}>{dict.company.slogan}</p>
                <span className={styles.cardEstablished}>{dict.company.established}</span>
              </div>
              <address style={{ fontStyle: "normal" }}>
                <div className={styles.contactRow}><span className={styles.contactRowIcon}><PhoneIcon /></span><div className={styles.contactRowContent}><span className={styles.contactRowLabel}>{dict.contact.phoneLabel}</span><a href={`tel:${dict.company.phoneIntl}`} className={styles.contactRowLink} dir="ltr">{dict.company.phone}</a></div></div>
                <div className={styles.contactRow}><span className={styles.contactRowIcon}><WaIcon /></span><div className={styles.contactRowContent}><span className={styles.contactRowLabel}>{dict.contact.whatsappLabel}</span><a href={`https://wa.me/${dict.company.whatsappIntl.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={styles.contactRowLink} dir="ltr">{dict.company.whatsapp}</a></div></div>
                <div className={styles.contactRow}><span className={styles.contactRowIcon}><MailIcon /></span><div className={styles.contactRowContent}><span className={styles.contactRowLabel}>{dict.contact.emailLabel}</span><a href={`mailto:${dict.company.email}`} className={styles.contactRowLink}>{dict.company.email}</a></div></div>
                <div className={styles.contactRow}><span className={styles.contactRowIcon}><LocIcon /></span><div className={styles.contactRowContent}><span className={styles.contactRowLabel}>{dict.contact.addressLabel}</span><span className={styles.contactRowValue}>{dict.company.address}</span></div></div>
              </address>
              <div className={styles.socialRow}>
                <span className={styles.socialLabel}>{isAr ? "تابعنا" : "Follow us"}</span>
                <a href={dict.company.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook"><FbIcon /></a>
                <a href={dict.company.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram"><IgIcon /></a>
                <a href={`https://wa.me/${dict.company.whatsappIntl.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="WhatsApp"><WaIcon /></a>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/9RNp9aWWJEsAVoPA9"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapBlock}
              aria-label={isAr ? "افتح في خرائط جوجل" : "Open in Google Maps"}
            >
              <div className={styles.mapPlaceholder} role="img" aria-label={dict.company.address}>
                <svg className={styles.mapIcon} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className={styles.mapAddress}>{dict.company.address}</p>
                <span className={styles.mapCta}>
                  {isAr ? "فتح في خرائط جوجل ↗" : "Open in Google Maps ↗"}
                </span>
              </div>
            </a>
          </div>
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h2 className={styles.formCardHeading}>{isAr ? "أرسل استفساراً" : "Send an inquiry"}</h2>
              <p className={styles.formCardSubheading}>{isAr ? "سيتم توجيه رسالتك مباشرةً إلى واتساب فريقنا." : "Your message will be sent directly to our WhatsApp."}</p>
              <div className={styles.formDivider} aria-hidden="true" />
              <ContactForm locale={locale} whatsappNumber={dict.company.whatsappIntl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
