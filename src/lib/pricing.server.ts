import "server-only";

import { supabase } from "./supabase/client";
import type { Coupon, PricingOverrides } from "./pricing";

export async function getPricingOverrides(): Promise<PricingOverrides> {
  return fetchPricingOverrides();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function fetchPricingOverrides(): Promise<PricingOverrides> {
  try {
    const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const response = await fetch(
      `${supabaseUrl}/rest/v1/product_pricing?select=*`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        next: { revalidate: 60, tags: ["product-pricing"] },
      }
    );
    if (!response.ok) return {};

    const data = (await response.json()) as Array<{
      product_slug: string;
      price: number | string;
      discount_price: number | string | null;
      stock_quantity: number | null;
      is_available: boolean;
    }>;

    return data.reduce((acc, row) => {
      acc[row.product_slug] = {
        product_slug: row.product_slug,
        price: Number(row.price),
        discount_price: row.discount_price === null ? null : Number(row.discount_price),
        stock_quantity: row.stock_quantity ?? 100,
        is_available: row.is_available,
      };
      return acc;
    }, {} as PricingOverrides);
  } catch {
    return {};
  }
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  if (!code) return null;

  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return data as Coupon;
  } catch {
    return null;
  }
}
