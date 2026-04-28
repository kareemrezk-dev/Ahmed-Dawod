import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { Configurator } from "@/components/Configurator/Configurator";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr
    ? "البحث بالمقاس | أحمد داود لتجارة رولمان البلي"
    : "Bearing Size Finder | Ahmed Dawod Bearings";
  const description = isAr
    ? "ابحث عن البلية المناسبة عن طريق إدخال القطر الداخلي والخارجي والعرض بالملليمتر"
    : "Find the right bearing by entering inner diameter, outer diameter, and width in mm";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ConfiguratorPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  return <Configurator locale={locale} dict={dict} />;
}
