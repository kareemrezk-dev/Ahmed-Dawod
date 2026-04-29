import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, localeConfig, type Locale } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { OrganizationJsonLd } from "@/lib/OrganizationJsonLd";
import { getDictionary } from "@/lib/getDictionary";
import { PromoBanner } from "@/components/PromoBanner/PromoBanner";
import { Navbar } from "@/components/Navbar/Navbar";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Footer } from "@/components/Footer/Footer";
import { BackToTop } from "@/components/BackToTop/BackToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton/WhatsAppButton";
import { AiAssistant } from "@/components/AiAssistant/AiAssistant";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

import { CartProvider } from "@/lib/CartContext";

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
      </head>
      <body className={`${inter.variable} ${cairo.variable}`}>
        <CartProvider>
          <PromoBanner locale={locale} />
          <Navbar locale={locale} />
          <SearchBar locale={locale} dict={dict} />
          <main>{children}</main>
          <Footer locale={locale} />
          <BackToTop label={dict.backToTop} />
          <WhatsAppButton
            whatsappNumber={dict.company.whatsappIntl}
            label={dict.contact.whatsappLabel}
            message={
              locale === "ar"
                ? "السلام عليكم، لدي استفسار بخصوص منتجاتكم."
                : "Hello, I have an inquiry about your products."
            }
          />
          <AiAssistant locale={locale} dict={dict} />
        </CartProvider>
      </body>
    </html>
  );
}

