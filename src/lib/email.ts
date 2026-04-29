import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ahmeddawod.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "orders@ahmeddawod.com";

interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

export async function sendOrderNotification(data: OrderNotificationData): Promise<boolean> {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY not set — skipping email notification");
    return false;
  }

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:left">${item.unitPrice} ج.م</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:left">${item.unitPrice * item.quantity} ج.م</td>
        </tr>`
    )
    .join("");

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#2A5895,#1e4a80);padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">🔔 طلب جديد!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px">${data.orderNumber}</p>
      </div>

      <div style="padding:24px">
        <h2 style="font-size:16px;color:#374151;margin:0 0 12px;border-bottom:2px solid #2A5895;padding-bottom:8px">👤 بيانات العميل</h2>
        <table style="width:100%;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:4px 0;color:#6b7280;width:100px">الاسم:</td><td style="padding:4px 0;font-weight:600">${data.customerName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">التليفون:</td><td style="padding:4px 0;font-weight:600;direction:ltr;text-align:right"><a href="tel:${data.customerPhone}" style="color:#2A5895">${data.customerPhone}</a></td></tr>
          ${data.governorate ? `<tr><td style="padding:4px 0;color:#6b7280">المحافظة:</td><td style="padding:4px 0">${data.governorate}</td></tr>` : ""}
          ${data.address ? `<tr><td style="padding:4px 0;color:#6b7280">العنوان:</td><td style="padding:4px 0">${data.address}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#6b7280">الدفع:</td><td style="padding:4px 0">${data.paymentMethod}</td></tr>
        </table>

        <h2 style="font-size:16px;color:#374151;margin:0 0 12px;border-bottom:2px solid #2A5895;padding-bottom:8px">📦 المنتجات</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:right;font-weight:600">المنتج</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600">الكمية</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">السعر</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">الإجمالي</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="background:#f9fafb;border-radius:8px;padding:16px;font-size:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>المجموع الفرعي:</span><span>${data.subtotal} ج.م</span></div>
          ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#16a34a"><span>الخصم${data.couponCode ? ` (${data.couponCode})` : ""}:</span><span>-${data.discount} ج.م</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:800;border-top:2px solid #e5e7eb;padding-top:10px;margin-top:6px;color:#2A5895"><span>الإجمالي النهائي:</span><span>${data.total} ج.م</span></div>
        </div>
      </div>

      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">
        أحمد داود لتجارة رولمان البلي — إشعار آلي
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 طلب جديد ${data.orderNumber} — ${data.customerName}`,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email notification failed:", err);
    return false;
  }
}
