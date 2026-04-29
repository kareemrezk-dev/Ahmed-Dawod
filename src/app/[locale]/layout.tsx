import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Script from "next/script";
import { locales, localeConfig, type Locale } from "@/lib/i18n";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { OrganizationJsonLd } from "@/lib/OrganizationJsonLd";
import { getDictionary } from "@/lib/getDictionary";
import { PromoBanner } from "@/components/PromoBanner/PromoBanner";
import { Navbar } from "@/components/Navbar/Navbar";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Footer } from "@/components/Footer/Footer";
import { CartProvider } from "@/lib/CartContext";

// ── Lazy-loaded client-only components (not needed for first paint) ──────────
const BackToTop = dynamic(
  () => import("@/components/BackToTop/BackToTop").then((m) => m.BackToTop),
  { ssr: false }
);
const WhatsAppButton = dynamic(
  () => import("@/components/WhatsAppButton/WhatsAppButton").then((m) => m.WhatsAppButton),
  { ssr: false }
);
const AiAssistant = dynamic(
  () => import("@/components/AiAssistant/AiAssistant").then((m) => m.AiAssistant),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

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
        <meta name="theme-color" content="#2A5895" />
        <meta name="color-scheme" content="light" />
        <OrganizationJsonLd locale={locale} />
        <link rel="help" href="/llms.txt" type="text/plain" title="LLM Site Info" />
        <link rel="alternate" href="/llms-full.txt" type="text/plain" title="Full Product Catalog for AI" />
        <link rel="author" href="/.well-known/ai-plugin.json" type="application/json" />
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
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
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}`,
          }}
        />
      </body>
    </html>
  );
}

