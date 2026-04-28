import type { Metadata } from "next";
import { Suspense } from "react";
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
      {/* 1. Hero — above the fold, renders immediately */}
      <Hero locale={locale} dict={dict} />
      {/* 2. Categories — below fold, streamed */}
      <Suspense fallback={null}>
        <CategoriesGrid locale={locale} />
      </Suspense>
      {/* 3. Brands */}
      <Suspense fallback={null}>
        <BrandsSlider locale={locale} dict={dict} />
      </Suspense>
      {/* 4. Featured Products */}
      <Suspense fallback={null}>
        <FeaturedProducts locale={locale} dict={dict} />
      </Suspense>
      {/* 5. About */}
      <Suspense fallback={null}>
        <AboutSection locale={locale} dict={dict} />
      </Suspense>
      {/* 6. Footer rendered in layout.tsx */}
    </>
  );
}
