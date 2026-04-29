import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { AiFullPage } from "./AiFullPage";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const title = params.locale === "ar" ? "المساعد الذكي — بحث بالصور والذكاء الاصطناعي" : "AI Assistant — Smart Visual Search";
  return generateLocaleMetadata(params.locale, title);
}

export default async function AiPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  return <AiFullPage locale={locale} dict={dict} />;
}
