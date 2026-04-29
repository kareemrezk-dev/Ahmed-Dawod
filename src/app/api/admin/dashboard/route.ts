import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify admin session via cookie (middleware already does this, but double check)
  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();
    const now = new Date();

    // ── Date ranges ──
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // ── 1. Orders overview ──
    const { data: allOrders } = await supabase
      .from("orders")
      .select("id, total, status, created_at, payment_method, coupon_code")
      .order("created_at", { ascending: false });

    const orders = allOrders || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);

    const todayOrders = orders.filter(o => o.created_at >= todayStart);
    const weekOrders = orders.filter(o => o.created_at >= weekStart);
    const monthOrders = orders.filter(o => o.created_at >= monthStart);

    const todayRevenue = todayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);

    // ── 2. Status breakdown ──
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // ── 3. Payment method breakdown ──
    const paymentCounts: Record<string, number> = {};
    orders.forEach(o => {
      const method = o.payment_method || "غير محدد";
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });

    // ── 4. Coupon usage ──
    const couponOrders = orders.filter(o => o.coupon_code);
    const couponUsage = couponOrders.length;

    // ── 5. Top products (from order_items) ──
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name_ar, product_brand, quantity, total_price");

    const productMap = new Map<string, { name: string; brand: string; quantity: number; revenue: number }>();
    (orderItems || []).forEach(item => {
      const key = item.product_name_ar;
      const existing = productMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += Number(item.total_price) || 0;
      } else {
        productMap.set(key, {
          name: item.product_name_ar,
          brand: item.product_brand || "",
          quantity: item.quantity,
          revenue: Number(item.total_price) || 0,
        });
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // ── 6. Recent orders ──
    const { data: recentOrdersRaw } = await supabase
      .from("orders")
      .select(`
        id, order_number, total, status, payment_method, created_at,
        customers ( name, phone )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentOrders = (recentOrdersRaw || []).map(o => ({
      id: o.id,
      order_number: o.order_number,
      total: o.total,
      status: o.status,
      payment_method: o.payment_method,
      created_at: o.created_at,
      customer_name: (o.customers as any)?.name || "—",
      customer_phone: (o.customers as any)?.phone || "—",
    }));

    // ── 7. Customers count ──
    const { count: customersCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true });

    // ── 8. Products count ──
    const { count: productsCount } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    // ── 9. Daily orders for chart (last 14 days) ──
    const dailyOrders: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      dailyOrders.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      });
    }

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
        weekOrders: weekOrders.length,
        weekRevenue,
        monthOrders: monthOrders.length,
        monthRevenue,
        customersCount: customersCount || 0,
        productsCount: productsCount || 0,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        couponUsage,
      },
      statusCounts,
      paymentCounts,
      topProducts,
      recentOrders,
      dailyOrders,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
