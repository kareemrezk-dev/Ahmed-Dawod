import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { sendOrderNotification } from "@/lib/email";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Generate a human-readable order number
function generateOrderNumber(): string {
  const date = new Date();
  const d = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${d}-${rand}`;
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, RATE_LIMITS.orders);
  if (limited) return limited;

  try {
    const body = await request.json();
    const supabase = getServiceClient();

    // Validate required fields
    const { customer, items, payment_method, coupon_code, notes, address } = body;

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: "الاسم ورقم التليفون مطلوبين" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "لا توجد منتجات في الطلب" },
        { status: 400 }
      );
    }

    // 1. Upsert customer (by phone)
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", customer.phone)
      .single();

    let customerId: string;

    if (existingCustomer) {
      // Update existing customer info
      await supabase
        .from("customers")
        .update({
          name: customer.name,
          address: address || "",
        })
        .eq("id", existingCustomer.id);
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || "",
          address: address || "",
        })
        .select("id")
        .single();

      if (custErr || !newCustomer) {
        return NextResponse.json(
          { error: "فشل في إنشاء بيانات العميل" },
          { status: 500 }
        );
      }
      customerId = newCustomer.id;
    }

    // 2. Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { unit_price: number; quantity: number }) =>
        sum + item.unit_price * item.quantity,
      0
    );
    const discountAmount = body.discount_amount || 0;
    const total = subtotal - discountAmount;

    // 3. Create order
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: "pending",
        payment_method: payment_method || "الدفع عند الاستلام",
        payment_status: "pending",
        subtotal,
        discount_amount: discountAmount,
        coupon_code: coupon_code || null,
        total,
        shipping_address: address || "",
        shipping_phone: customer.phone,
        notes: notes || "",
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: `فشل في إنشاء الطلب: ${orderErr?.message}` },
        { status: 500 }
      );
    }

    // 4. Create order items
    const orderItems = items.map(
      (item: {
        product_slug: string;
        product_name_ar: string;
        product_name_en: string;
        product_brand: string;
        quantity: number;
        unit_price: number;
      }) => ({
        order_id: order.id,
        product_slug: item.product_slug,
        product_name_ar: item.product_name_ar,
        product_name_en: item.product_name_en,
        product_brand: item.product_brand || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      })
    );

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      // Rollback: delete order if items fail
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: `فشل في إضافة المنتجات: ${itemsErr.message}` },
        { status: 500 }
      );
    }

    // 5. Send email notification (non-blocking)
    sendOrderNotification({
      orderNumber: order.order_number,
      customerName: customer.name,
      customerPhone: customer.phone,
      address: address || "",
      paymentMethod: payment_method || "الدفع عند الاستلام",
      items: items.map((item: { product_name_ar: string; quantity: number; unit_price: number }) => ({
        name: item.product_name_ar,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
      subtotal,
      discount: discountAmount,
      couponCode: coupon_code || null,
      total,
    }).catch(() => {}); // Fire and forget

    return NextResponse.json(
      {
        success: true,
        order_number: order.order_number,
        order_id: order.id,
        total,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
