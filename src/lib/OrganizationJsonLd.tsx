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

  // E-commerce Store schema — for AI models reading the page
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: dict.company.name,
    alternateName: "Ahmed Dawod Industrial Bearings",
    description: "Egypt's leading supplier of industrial bearings and precision components. 589+ products from top global brands including SKF, FAG, NSK, NTN, KOYO, NACHI, INA, IKO, THK, TIMKEN. Categories: bearings, linear motion, ball screws, hard chrome, lead screws, fasteners, housings, pulleys.",
    url: "https://ahmeddawod.com",
    telephone: dict.company.phoneIntl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "مول المصرية سنتر 1، محل رقم 30 و 86",
      addressLocality: "العاشر من رمضان",
      addressRegion: "محافظة الشرقية",
      addressCountry: "EG",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Industrial Bearings & Components",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Bearings (بلي)", description: "Deep groove, needle, cam follower, spindle, miniature, stainless steel, high-temperature bearings" },
        { "@type": "OfferCatalog", name: "Linear Motion (لينير)", description: "Linear bearings and shafts" },
        { "@type": "OfferCatalog", name: "Ball Screw (بول سكرو)", description: "Ball screw shafts, nuts, and assemblies" },
        { "@type": "OfferCatalog", name: "Hard Chrome (هارد كروم)", description: "Hard chrome plated shafts and bearings" },
        { "@type": "OfferCatalog", name: "Housings (كراسي)", description: "Pillow block, flange, and take-up housings" },
        { "@type": "OfferCatalog", name: "Fasteners (تثبيتات)", description: "Mounting blocks, nuts, and accessories" },
        { "@type": "OfferCatalog", name: "Pulleys & Sleeves (جلب)", description: "Adapter sleeves, taper bushings, pulleys" },
      ],
    },
    brand: [
      { "@type": "Brand", name: "SKF" },
      { "@type": "Brand", name: "FAG" },
      { "@type": "Brand", name: "NSK" },
      { "@type": "Brand", name: "NTN" },
      { "@type": "Brand", name: "KOYO" },
      { "@type": "Brand", name: "TIMKEN" },
      { "@type": "Brand", name: "INA" },
      { "@type": "Brand", name: "IKO" },
      { "@type": "Brand", name: "THK" },
      { "@type": "Brand", name: "NACHI" },
    ],
    paymentAccepted: "Cash on Delivery (الدفع عند الاستلام), Vodafone Cash (فودافون كاش), InstaPay (إنستا باي)",
    currenciesAccepted: "EGP",
    areaServed: { "@type": "Country", name: "Egypt" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />
    </>
  );
}
