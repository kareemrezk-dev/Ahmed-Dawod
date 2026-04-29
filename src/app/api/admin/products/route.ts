import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function isAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/api/admin/verify`,
      { headers: { Cookie: `admin_token=${token}` } }
    );
    return res.ok;
  } catch {
    // Fallback: just check token exists
    return !!token;
  }
}

// GET /api/admin/products — list all products
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const search = url.searchParams.get("search") || "";
  const topCategory = url.searchParams.get("topCategory") || "";

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (topCategory) {
    query = query.eq("top_category", topCategory);
  }

  if (search) {
    const s = `%${search}%`;
    query = query.or(
      `name_ar.ilike.${s},name_en.ilike.${s},model_number.ilike.${s},brand.ilike.${s},slug.ilike.${s}`
    );
  }

  const from = (page - 1) * limit;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data, total: count, page, limit });
}

// POST /api/admin/products — create product
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const body = await request.json();

  const row = {
    slug: body.slug,
    model_number: body.model_number || "",
    top_category: body.top_category || "bearings",
    category: body.category || "",
    brand: body.brand || "",
    name_ar: body.name_ar || "",
    name_en: body.name_en || "",
    description_ar: body.description_ar || "",
    description_en: body.description_en || "",
    specs: body.specs || [],
    tags: body.tags || [],
    sizes: body.sizes || [],
    featured: body.featured || false,
    image: body.image || null,
    images: body.images || [],
    price: body.price || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}

// PUT /api/admin/products — update product
export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

// DELETE /api/admin/products — delete product
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
