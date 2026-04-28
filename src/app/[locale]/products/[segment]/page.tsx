import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { generateLocaleMetadata } from "@/lib/generateMetadata";
import { getDictionary } from "@/lib/getDictionary";
import {
  getProductBySlug, getAllSlugs,
  getAllTopCategories, getProductsByTopCategory,
  getAllBrands, topCategoryLabels, topCategoryMap,
  getProductImagePath, getProductImageAlt,
  getCategoryLabel, getProductName, getProductDescription, getProductModelNumber,
  type TopCategory, type Product,
} from "@/lib/products";
import { getPricingOverrides } from "@/lib/pricing.server";
import { formatPrice, getPricingDetails } from "@/lib/pricing";
import { Breadcrumb } from "@/components/Breadcrumb/Breadcrumb";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import { ProductsFilter } from "@/components/ProductsFilter/ProductsFilter";
import { Pagination } from "@/components/Pagination/Pagination";
import { RelatedProducts } from "@/components/RelatedProducts/RelatedProducts";
import { SizeSelector } from "./SizeSelector";
import { DynamicModelBadge } from "./DynamicModelBadge";
import { ProductGallery } from "./ProductGallery";
import { CategoryListClient } from "./CategoryListClient";
import { OrderSection } from "./OrderSection";
import { AddToCartSection } from "./AddToCartSection";
import { TopCategoriesNav } from "@/components/TopCategoriesNav/TopCategoriesNav";
import { ShareButton } from "@/components/ShareButton/ShareButton";
import { CopyButton } from "@/components/CopyButton/CopyButton";
import detailStyles from "./detail.module.css";
import listStyles from "./list.module.css";

const PAGE_SIZE = 12;

interface PageProps {
  params: { locale: Locale; segment: string };
  searchParams: { subcategory?: string; brand?: string; size?: string; page?: string };
}

/* ── generateStaticParams: both top-cats + product slugs ── */
export async function generateStaticParams() {
  return locales.flatMap((locale) => [
    ...getAllTopCategories().map((segment) => ({ locale, segment: encodeURIComponent(segment) })),
    ...getAllSlugs().map((segment) => ({ locale, segment: encodeURIComponent(segment) })),
  ]);
}

/* ── Metadata ── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, segment } = params;
  const decodedSegment = decodeURIComponent(segment);

  /* Category page metadata */
  if ((getAllTopCategories() as string[]).includes(decodedSegment)) {
    const labels = topCategoryLabels[decodedSegment as TopCategory];
    const label = locale === "ar" ? labels.ar : labels.en;
    return generateLocaleMetadata(locale, label);
  }

  /* Product page metadata — spec-exact format */
  const product = getProductBySlug(decodedSegment);
  if (product) {
    const name = getProductName(product, locale);
    const model = getProductModelNumber(product, locale);
    const title = `${product.brand} ${model} ${name} | Ahmed Dawod Egypt`;
    const description =
      locale === "ar"
        ? `اشترِ ${product.brand} ${model} ${product.nameAr || name} في مصر. أحمد داود يوفر رولمان أصلي من الماركات العالمية SKF وNSK وNTN وFAG.`
        : `Buy ${product.brand} ${model} ${name} in Egypt. Ahmed Dawod supplies original industrial bearings from global brands including SKF, NSK, NTN and FAG.`;

    const BASE = "https://ahmeddawod.com";
    return {
      metadataBase: new URL(BASE),
      title,
      description,
      alternates: {
        canonical: `${BASE}/${locale}/products/${segment}`,
        languages: {
          ar: `${BASE}/ar/products/${segment}`,
          en: `${BASE}/en/products/${segment}`,
          "x-default": `${BASE}/ar/products/${segment}`,
        },
      },
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "Ahmed Dawod Bearings",
        url: `${BASE}/${locale}/products/${segment}`,
        images: [{ url: `${BASE}${getProductImagePath(product)}`, width: 600, height: 600, alt: title }],
      },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }
  return {};
}

/* ════════════════════ PRODUCT DETAIL ════════════════════ */

function ProductVisualSvg({ category }: { category: string }) {
  if (category.includes("كروي") || category.includes("ball") || category.includes("球")) {
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true" className={detailStyles.visualSvg}>
        <circle cx="150" cy="150" r="130" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.7" />
        {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * 2 * Math.PI; return <circle key={i} cx={150 + 115 * Math.cos(a)} cy={150 + 115 * Math.sin(a)} r="9" fill="#1d4ed8" opacity="0.55" />; })}
        <circle cx="150" cy="150" r="85" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
        <circle cx="150" cy="150" r="55" stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
        <circle cx="150" cy="150" r="28" fill="rgba(29,78,216,0.06)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.5" />
        <line x1="130" y1="150" x2="170" y2="150" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.5" />
        <line x1="150" y1="130" x2="150" y2="170" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.5" />
        <circle cx="150" cy="150" r="4" fill="#1d4ed8" opacity="0.9" />
      </svg>
    );
  }
  if (category.includes("مخروطي") || category.includes("tapered") || category.includes("锥")) {
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true" className={detailStyles.visualSvg}>
        <path d="M50 260 L150 40 L250 260 Z" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.7" />
        <path d="M70 210 L230 210" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.4" strokeDasharray="5 5" />
        <path d="M92 165 L208 165" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.4" strokeDasharray="5 5" />
        <path d="M114 120 L186 120" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.4" strokeDasharray="5 5" />
        <circle cx="150" cy="40" r="5" fill="#1d4ed8" opacity="0.9" />
      </svg>
    );
  }
  if (category.includes("أسطواني") || category.includes("cylindrical") || category.includes("圆柱")) {
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true" className={detailStyles.visualSvg}>
        <rect x="30" y="30" width="240" height="240" rx="28" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.7" />
        {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * 2 * Math.PI, r = 90; return <rect key={i} x={150 + r * Math.cos(a) - 6} y={150 + r * Math.sin(a) - 14} width="12" height="28" rx="6" fill="#1d4ed8" opacity="0.55" transform={`rotate(${(i / 12) * 360},${150 + r * Math.cos(a)},${150 + r * Math.sin(a)})`} />; })}
        <circle cx="150" cy="150" r="55" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
        <circle cx="150" cy="150" r="28" fill="rgba(29,78,216,0.06)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true" className={detailStyles.visualSvg}>
      <rect x="30" y="90" width="240" height="140" rx="10" stroke="#1d4ed8" strokeWidth="2.5" opacity="0.7" />
      <circle cx="150" cy="155" r="55" stroke="#1d4ed8" strokeWidth="2" opacity="0.7" />
      <circle cx="150" cy="155" r="28" fill="rgba(29,78,216,0.07)" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.8" />
      <circle cx="50" cy="215" r="12" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
      <circle cx="250" cy="215" r="12" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

async function ProductDetailView({ product, locale }: { product: Product; locale: Locale }) {
  const dict = await getDictionary(locale);
  const pricingOverrides = await getPricingOverrides();
  const name = getProductName(product, locale);
  const model = getProductModelNumber(product, locale);
  const description = getProductDescription(product, locale);
  const categoryLabel = getCategoryLabel(product.category, locale);
  
  const waMsg =
    locale === "ar" ? `السلام عليكم، أرغب في الاستفسار عن ${categoryLabel} موديل: ${model}` :
    `Hello, I'd like to inquire about ${categoryLabel} model: ${model}`;
  
  const waUrl = `https://wa.me/${dict.company.whatsappIntl.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`;
  const breadcrumbItems = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.products.breadcrumbProducts, href: `/${locale}/products` },
    { label: topCategoryLabels[product.topCategory as TopCategory]?.[locale === "ar" ? "ar" : "en"] ?? product.topCategory, href: `/${locale}/products/${product.topCategory}` },
    { label: getCategoryLabel(product.category, locale), href: `/${locale}/products/${product.topCategory}?subcategory=${encodeURIComponent(product.category)}` },
    { label: model },
  ];
  const BASE = "https://ahmeddawod.com";
  const productPricing = pricingOverrides[product.slug] ?? null;
  const { finalPrice } = getPricingDetails(product, productPricing);
  
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${model} ${name}`,
    description: getProductDescription(product, locale),
    brand: { "@type": "Brand", name: product.brand },
    sku: model,
    mpn: product.modelNumber,
    model: model,
    category: product.category,
    image: `${BASE}${getProductImagePath(product)}`,
    manufacturer: { "@type": "Organization", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${BASE}/${locale}/products/${product.slug}`,
      availability: "https://schema.org/InStock",
      areaServed: "EG",
      ...(finalPrice !== null ? { priceCurrency: "EGP", price: finalPrice } : {}),
      seller: {
        "@type": "Organization",
        name: "Ahmed Dawod Bearings",
        url: "https://ahmeddawod.com",
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE}${item.href}` } : {}),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className={detailStyles.page}>
        <div className={detailStyles.container}>
          <div className={detailStyles.breadcrumbRow}>
            <Breadcrumb items={breadcrumbItems} locale={locale} />
          </div>
          <div className={detailStyles.productLayout}>
            {/* Visual — Product Gallery */}
            <div className={detailStyles.visualPanel}>
              <ProductGallery 
                images={product.images && product.images.length > 0 ? product.images : [getProductImagePath(product)]} 
                altText={getProductImageAlt(product)} 
                basePartNumber={model}
              />
              <DynamicModelBadge
                basePartNumber={model}
                modelLabel={dict.products.modelLabel}
              />
              {product.specs.slice(0, 3).map((spec) => (
                <div key={spec.labelEn} className={detailStyles.specMiniCard}>
                  <span className={detailStyles.specMiniKey}>{locale === "ar" ? spec.labelAr : spec.labelEn}</span>
                  <span className={detailStyles.specMiniValue}>{spec.value}</span>
                </div>
              ))}
            </div>
            {/* Info */}
            <div className={detailStyles.infoPanel}>
              <header className={detailStyles.productHeader}>
                <div className={detailStyles.categoryTag}><span className={detailStyles.categoryDot} />{getCategoryLabel(product.category, locale)}</div>
                <h1 className={detailStyles.productTitle}>{name}</h1>
                <div className={detailStyles.metaRow}>
                  <span className={detailStyles.brandPill}>{product.brand}</span>
                  {name.toLowerCase() !== model.toLowerCase() && (
                    <span className={detailStyles.modelChip}>{model}</span>
                  )}
                </div>
                {finalPrice !== null && (
                  <div className={detailStyles.priceDisplay}>
                    <span className={detailStyles.priceLabel}>{locale === "ar" ? "السعر:" : "Price:"}</span>
                    <span className={detailStyles.currentPrice}>{formatPrice(finalPrice, locale)}</span>
                  </div>
                )}
                <p className={detailStyles.productDescription}>{description}</p>
                <div className={detailStyles.shareRow}>
                  <ShareButton title={`${product.brand} ${model} | ${locale === "ar" ? "أحمد داود" : "Ahmed Dawod"}`} locale={locale} />
                </div>
              </header>
              {/* Static specs (shown always) */}
              <section className={detailStyles.specsBlock} aria-labelledby="specs-heading">
                <h2 className={detailStyles.specsHeading} id="specs-heading">{dict.products.specsHeading}</h2>
                <table className={detailStyles.specsTable}>
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.labelEn} className={detailStyles.specRow}>
                        <td className={detailStyles.specKey}>{locale === "ar" ? spec.labelAr : spec.labelEn}</td>
                        <td className={detailStyles.specValue}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              {product.tags.length > 0 && (
                <div className={detailStyles.tagsRow}>
                  {product.tags.map((tag) => <span key={tag} className={detailStyles.tag}>{tag}</span>)}
                </div>
              )}
              {/* Reactive size selector — updates part number, specs, WhatsApp */}
              {product.sizes && product.sizes.length > 0 ? (
                <div className={detailStyles.sizeBlock}>
                  <span className={detailStyles.sizeBlockLabel}>{dict.products.sizeLabel}</span>
                  <SizeSelector
                    sizes={product.sizes}
                    basePartNumber={model}
                    selectLabel={dict.products.selectSize}
                    locale={locale}
                    waBase={dict.company.whatsappIntl.replace(/\D/g, "")}
                    phone={dict.company.phone}
                    phoneIntl={dict.company.phoneIntl}
                    waModelLabel={locale === "ar" ? "الموديل: " : "Model: "}
                    categoryLabel={categoryLabel}
                  />
                  <AddToCartSection
                    product={product}
                    locale={locale}
                    pricing={pricingOverrides[product.slug] ?? null}
                  />
                </div>
              ) : (
                <>
                  <OrderSection
                    product={product}
                    locale={locale}
                    dict={dict}
                    pricing={pricingOverrides[product.slug] ?? null}
                  />
                  <AddToCartSection
                    product={product}
                    locale={locale}
                    pricing={pricingOverrides[product.slug] ?? null}
                  />
                </>
              )}
            </div>
          </div>
          <RelatedProducts product={product} locale={locale} dict={dict} pricingOverrides={pricingOverrides} />
        </div>
      </div>
    </>
  );
}

/* ════════════════════ CATEGORY LIST ════════════════════ */

async function CategoryListView({
  locale, topCat,
}: {
  locale: Locale; topCat: TopCategory;
}) {
  const dict = await getDictionary(locale);
  const pricingOverrides = await getPricingOverrides();
  const labels = topCategoryLabels[topCat];
  const categoryLabel = locale === "ar" ? labels.ar : labels.en;

  const breadcrumbItems = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.products.breadcrumbProducts, href: `/${locale}/products` },
    { label: categoryLabel },
  ];

  return (
    <div className={listStyles.page}>
      <div className={listStyles.container}>
        <header className={listStyles.pageHeader}>
          <div className={listStyles.breadcrumbRow}><Breadcrumb items={breadcrumbItems} locale={locale} /></div>
          <h1 className={listStyles.pageTitle}>{categoryLabel}</h1>
          <p className={listStyles.pageSubtitle}>{dict.products.subtitle}</p>
        </header>

        <TopCategoriesNav locale={locale} activeTopCat={topCat} />
        <CategoryListClient locale={locale} dict={dict} topCat={topCat} pricingOverrides={pricingOverrides} />
      </div>
    </div>
  );
}

/* ════════════════════ ROUTER ════════════════════ */

export default async function SegmentPage({ params, searchParams }: PageProps) {
  const { locale, segment } = params;
  const decodedSegment = decodeURIComponent(segment);

  // Top-category route? e.g. /products/bearings
  if ((getAllTopCategories() as string[]).includes(decodedSegment)) {
    return <CategoryListView locale={locale} topCat={decodedSegment as TopCategory} />;
  }

  // Product detail route? e.g. /products/skf-6205-2rs
  const product = getProductBySlug(decodedSegment);
  if (product) {
    return <ProductDetailView product={product} locale={locale} />;
  }

  notFound();
}
