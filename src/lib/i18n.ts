export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const localeConfig: Record<Locale, { dir: "rtl" | "ltr"; hrefLang: string }> = {
  ar: { dir: "rtl", hrefLang: "ar" },
  en: { dir: "ltr", hrefLang: "en" },
};

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
