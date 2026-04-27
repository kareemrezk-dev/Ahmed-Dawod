import type { Product } from "./products";

export interface ProductPricing {
  product_slug: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  is_available: boolean;
}

export interface Coupon {
  code: string;
  discount_percentage: number;
  is_active: boolean;
}

export type PricingOverrides = Record<string, ProductPricing>;

export interface PricingDetails {
  basePrice: number | null;
  discountPrice: number | null;
  finalPrice: number | null;
  hasDiscount: boolean;
  isAvailable: boolean;
  stockQuantity: number | null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isProductPricing(value: ProductPricing | PricingOverrides): value is ProductPricing {
  return "product_slug" in value && "price" in value;
}

export function getPricingOverride(
  product: Product,
  overrides?: ProductPricing | PricingOverrides | null
): ProductPricing | null {
  if (!overrides) return null;
  if (isProductPricing(overrides)) return overrides;
  return overrides[product.slug] ?? null;
}

export function getPricingDetails(
  product: Product,
  overrides?: ProductPricing | PricingOverrides | null
): PricingDetails {
  const pricing = getPricingOverride(product, overrides);
  const basePrice = toNumber(pricing?.price) ?? toNumber(product.price);
  const discountPrice = toNumber(pricing?.discount_price);
  const finalPrice = discountPrice ?? basePrice;

  return {
    basePrice,
    discountPrice,
    finalPrice,
    hasDiscount: discountPrice !== null && basePrice !== null && discountPrice < basePrice,
    isAvailable: pricing?.is_available ?? true,
    stockQuantity: pricing?.stock_quantity ?? null,
  };
}

export function getFinalPrice(
  product: Product,
  overrides?: ProductPricing | PricingOverrides | null
): number | null {
  return getPricingDetails(product, overrides).finalPrice;
}

export function formatPrice(price: number, locale: string = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
