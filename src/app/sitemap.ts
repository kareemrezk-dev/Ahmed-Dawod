import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getAllSlugs, getAllTopCategories } from "@/lib/products";

const BASE = "https://ahmeddawod.com";

// Dates update automatically on every build
const SITE_LAST_MODIFIED = new Date();
const PRODUCT_LAST_MODIFIED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/products", "/contact", "/about"];
  const slugs = getAllSlugs();
  const topCats = getAllTopCategories();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    /* Static pages */
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: SITE_LAST_MODIFIED,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.7,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}${route}`])) },
      });
    }
    /* Category pages */
    for (const cat of topCats) {
      entries.push({
        url: `${BASE}/${locale}/products/${cat}`,
        lastModified: SITE_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.85,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}/products/${cat}`])) },
      });
    }
    /* Product pages — scalable: adding to products.ts auto-includes here */
    for (const slug of slugs) {
      entries.push({
        url: `${BASE}/${locale}/products/${slug}`,
        lastModified: PRODUCT_LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}/products/${slug}`])) },
      });
    }
  }
  return entries;
}
