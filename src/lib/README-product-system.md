# Ahmed Dawod — Automated Product Page Generation System

## Architecture

This system uses **Next.js 14 App Router static generation** to pre-render every product
page at build time. Adding a new product requires ONE step only.

## How to Add a New Product

1. Open `src/lib/products.ts`
2. Add one entry to the `products` array:

```typescript
{
  slug: "6210-2rs",            // URL slug: /products/bearings/6210-2rs
  modelNumber: "6210-2RS",
  topCategory: "bearings",
  category: "رولمان بلي كروي",
  brand: "SKF",
  nameAr: "رولمان بلي كروي 6210-2RS",
  nameEn: "Deep Groove Ball Bearing 6210-2RS",
  descriptionAr: "...",
  descriptionEn: "...",
  specs: [
    { labelAr: "القطر الداخلي", labelEn: "Bore Diameter", value: "50 mm" },
    // ...more specs
  ],
  tags: ["SKF"],
  sizes: ["6208-2RS", "6209-2RS", "6210-2RS"],
  featured: false,
  image: "/products/bearings/6210-2rs.webp",  // optional, auto-derived if omitted
}
```

3. Add the product image at `/public/products/bearings/6210-2rs.webp`
   - **Format:** WebP
   - **Dimensions:** 1000×1000px, white background, centered
   - **Max size:** 400KB

4. Run `npm run build` — the page `/ar/products/6210-2rs` is automatically generated
   in all 3 locales (ar, en, cn) and included in the sitemap.

## Scaling

| Products | Build time (estimate) | URLs generated |
|----------|-----------------------|----------------|
| 30       | ~20s                  | 90 (30 × 3 locales) |
| 500      | ~3 min                | 1,500 |
| 1,000    | ~5 min                | 3,000 |
| 2,000    | ~10 min               | 6,000 |

## Auto-generated per product

- ✅ Page with full layout (specs, images, size selector, WhatsApp)
- ✅ Unique `<title>`: `{Brand} {PartNumber} {Type} | Ahmed Dawod Egypt`
- ✅ Unique meta description
- ✅ `Product` JSON-LD schema
- ✅ `BreadcrumbList` JSON-LD schema (4 levels)
- ✅ `hreflang` alternates for all 3 locales
- ✅ Sitemap entry with `changeFrequency` and `priority`
- ✅ Product image with descriptive alt text

## Image path convention

```
/public/products/{topCategory}/{slug}.webp
```

Examples:
- `/public/products/bearings/6204-2rs.webp`
- `/public/products/linear/hgr20-linear-rail.webp`

If no `.webp` is provided, the system falls back to `.svg` placeholders.
