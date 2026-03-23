import { getDictionary } from "./getDictionary";
import type { Locale } from "./i18n";

export async function OrganizationJsonLd({ locale = "ar" }: { locale?: Locale } = {}) {
  const dict = await getDictionary(locale);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: dict.company.name,
    alternateName: "Ahmed Dawod",
    description: dict.meta.description,
    url: "https://ahmeddawod.com",
    foundingDate: "2015",
    address: {
      "@type": "PostalAddress",
      streetAddress: "مول المصرية سنتر 1، محل رقم 30 و 86",
      addressLocality: "العاشر من رمضان",
      addressRegion: "محافظة الشرقية",
      addressCountry: "EG",
    },
    contactPoint: [
      { "@type": "ContactPoint", telephone: dict.company.phoneIntl, contactType: "customer service", availableLanguage: ["Arabic", "English"] },
      { "@type": "ContactPoint", telephone: dict.company.whatsappIntl, contactType: "sales", availableLanguage: ["Arabic"] },
    ],
    sameAs: [
      dict.company.facebook,
      dict.company.instagram,
    ],
  };

  // WebSite schema enables Google Sitelinks Search Box
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.company.name,
    url: "https://ahmeddawod.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://ahmeddawod.com/${locale}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
