import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";
import { NavbarClient } from "./NavbarClient";

export async function Navbar({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale);
  return <NavbarClient locale={locale} dict={dict} />;
}
