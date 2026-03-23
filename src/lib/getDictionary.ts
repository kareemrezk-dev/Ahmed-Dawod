import type { Locale } from "./i18n";
import type { Dictionary } from "@/dictionaries/types";

const dictionaries: Record<Locale, () => Promise<unknown>> = {
  ar: () => import("@/dictionaries/ar").then((m) => m.ar),
  en: () => import("@/dictionaries/en").then((m) => m.en),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const result = await dictionaries[locale]();
  if (result && typeof result === "object" && "meta" in result) {
    return result as Dictionary;
  }
  throw new Error(`Dictionary not found for locale: ${locale}`);
}
