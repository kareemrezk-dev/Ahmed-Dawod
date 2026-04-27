import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { locales } from "./i18n";
import { getDictionary } from "./getDictionary";

const BASE_URL = "https://ahmeddawod.com";

const hrefLangMap: Record<Locale, string> = { ar: "ar", en: "en" };

export async function generateLocaleMetadata(
  locale: Locale,
  pageTitleKey?: string
): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const title = pageTitleKey
    ? dict.meta.titleTemplate.replace("%s", pageTitleKey)
    : dict.meta.siteName;

  const ogLocale = locale === "ar" ? "ar_EG" : "en_US";

  const languages = Object.fromEntries(
    locales.map((l) => [hrefLangMap[l], `${BASE_URL}/${l}`])
  );
  languages["x-default"] = `${BASE_URL}/ar`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description: dict.meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title,
      description: dict.meta.description,
      siteName: dict.meta.siteName,
      locale: ogLocale,
      type: "website",
      url: `${BASE_URL}/${locale}`,
      images: [{ url: `${BASE_URL}/logo.png`, width: 512, height: 512, alt: dict.meta.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}
