import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { getDictionary } from "@/lib/getDictionary";
import { Hero } from "@/components/Hero/Hero";
import { CategoriesGrid } from "@/components/CategoriesGrid/CategoriesGrid";
import { BrandsSlider } from "@/components/BrandsSlider/BrandsSlider";
import { FeaturedProducts } from "@/components/FeaturedProducts/FeaturedProducts";
import { AboutSection } from "@/components/AboutSection/AboutSection";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  return generateLocaleMetadata(params.locale);
}

export default async function LocalePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  return (
    <>
      {/* 1. Hero */}
      <Hero locale={locale} dict={dict} />
      {/* 2. Categories */}
      <CategoriesGrid locale={locale} />
      {/* 3. Brands */}
      <BrandsSlider locale={locale} dict={dict} />
      {/* 4. Featured Products */}
      <FeaturedProducts locale={locale} dict={dict} />
      {/* 5. About */}
      <AboutSection locale={locale} dict={dict} />
      {/* 6. Footer rendered in layout.tsx */}
    </>
  );
}
