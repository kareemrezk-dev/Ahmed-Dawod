import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { locales, localeConfig, type Locale } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { OrganizationJsonLd } from "@/lib/OrganizationJsonLd";
import { getDictionary } from "@/lib/getDictionary";
import { Navbar } from "@/components/Navbar/Navbar";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Footer } from "@/components/Footer/Footer";
import { BackToTop } from "@/components/BackToTop/BackToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton/WhatsAppButton";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;
  if (!locales.includes(locale)) return {};
  return generateLocaleMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  if (!locales.includes(locale)) notFound();

  const { dir } = localeConfig[locale];
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir}>
      <head>
        <OrganizationJsonLd locale={locale} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar locale={locale} />
        <SearchBar locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} />
        <BackToTop label={dict.backToTop} />
        <WhatsAppButton
          whatsappNumber={dict.company.whatsappIntl}
          label={dict.contact.whatsappLabel}
          message={
            locale === "ar" ? "مرحباً، أود الاستفسار عن منتجاتكم" :
            "Hello, I would like to inquire about your products"
          }
        />
      </body>
    </html>
  );
}
