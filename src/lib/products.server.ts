import "server-only";

import { supabase } from "./supabase/client";
import type { Product, TopCategory, CategoryName } from "./products";
import { products as localProducts } from "./products";

// ─── DB Row → Product mapper ─────────────────────────────────────────────────

interface DBProduct {
  slug: string;
  model_number: string;
  top_category: string;
  category: string;
  brand: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  specs: Array<{ labelAr: string; labelEn: string; value: string }>;
  tags: string[];
  sizes: string[];
  featured: boolean;
  image: string | null;
  images: string[];
  price: number | null;
  is_active: boolean;
}

function toProduct(row: DBProduct): Product {
  return {
    slug: row.slug,
    modelNumber: row.model_number,
    topCategory: row.top_category as TopCategory,
    category: row.category as CategoryName,
    brand: row.brand,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    specs: row.specs || [],
    tags: row.tags || [],
    sizes: row.sizes || [],
    featured: row.featured,
    image: row.image ?? undefined,
    images: row.images || [],
    price: row.price ?? undefined,
  };
}

// ─── Paginated query result ──────────────────────────────────────────────────

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Server-side product fetchers (with local fallback) ─────────────────────

export async function getProductsPaginated(
  page = 1,
  pageSize = 24,
  filters?: {
    topCategory?: string;
    category?: string;
    brand?: string;
    search?: string;
  }
): Promise<PaginatedProducts> {
  try {
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (filters?.topCategory) {
      query = query.eq("top_category", filters.topCategory);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.brand) {
      query = query.ilike("brand", filters.brand);
    }
    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(
        `name_ar.ilike.${s},name_en.ilike.${s},model_number.ilike.${s},brand.ilike.${s}`
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !data) throw error;

    const total = count ?? 0;

    return {
      products: data.map(toProduct),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (err) {
    console.warn("Supabase fetch failed, using local fallback:", err);
    return getLocalPaginated(page, pageSize, filters);
  }
}

export async function getServerProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) throw error;
    return toProduct(data);
  } catch {
    // Fallback to local
    return localProducts.find((p) => p.slug === slug);
  }
}

export async function getServerAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) throw error;
    return data.map(toProduct);
  } catch {
    return localProducts;
  }
}

export async function getServerFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("featured", true)
      .eq("is_active", true)
      .limit(8);

    if (error || !data || data.length === 0) throw new Error("No featured");
    return data.map(toProduct);
  } catch {
    return localProducts.filter((p) => p.featured);
  }
}

export async function getServerRelatedProducts(
  product: Product,
  limit = 6
): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("top_category", product.topCategory)
      .neq("slug", product.slug)
      .eq("is_active", true)
      .limit(limit);

    if (error || !data) throw error;
    return data.map(toProduct);
  } catch {
    return localProducts
      .filter((p) => p.slug !== product.slug && p.topCategory === product.topCategory)
      .slice(0, limit);
  }
}

export async function getServerAllBrands(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .eq("is_active", true);

    if (error || !data) throw error;
    const brands = [...new Set(data.map((r: { brand: string }) => r.brand))];
    return brands.sort();
  } catch {
    return [...new Set(localProducts.map((p) => p.brand))].sort();
  }
}

export async function getServerProductCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) throw error;
    return count ?? localProducts.length;
  } catch {
    return localProducts.length;
  }
}

// ─── Local fallback helpers ─────────────────────────────────────────────────

function getLocalPaginated(
  page: number,
  pageSize: number,
  filters?: {
    topCategory?: string;
    category?: string;
    brand?: string;
    search?: string;
  }
): PaginatedProducts {
  let filtered = [...localProducts];

  if (filters?.topCategory) {
    filtered = filtered.filter((p) => p.topCategory === filters.topCategory);
  }
  if (filters?.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  if (filters?.brand) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
    );
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nameAr.toLowerCase().includes(s) ||
        p.nameEn.toLowerCase().includes(s) ||
        p.modelNumber.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    products: paged,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
