import type { Product } from "./products";
import type { Locale } from "./i18n";
import { getProductName, getProductDescription, getProductModelNumber, getProductImagePath } from "./products";
import { getPricingDetails, type ProductPricing } from "./pricing";

export function ProductJsonLd({ product, locale, pricing }: { product: Product; locale: Locale; pricing?: ProductPricing | null }) {
  const name = getProductName(product, locale);
  const description = getProductDescription(product, locale);
  const model = getProductModelNumber(product, locale);
  const image = `https://ahmeddawod.com${getProductImagePath(product)}`;
  const { finalPrice } = getPricingDetails(product, pricing ?? null);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${model} ${name}`,
    description,
    image,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.modelNumber,
    mpn: product.modelNumber,
    category: product.category,
    manufacturer: { "@type": "Organization", name: product.brand },
  };

  if (finalPrice !== null) {
    schema.offers = {
      "@type": "Offer",
      url: `https://ahmeddawod.com/${locale}/products/${product.slug}`,
      priceCurrency: "EGP",
      price: finalPrice,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Ahmed Dawod" },
    };
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
