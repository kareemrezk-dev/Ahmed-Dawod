"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import { formatPrice, getPricingDetails, type ProductPricing } from "@/lib/pricing";
import styles from "./OrderSection.module.css";
import { getProductModelNumber } from "@/lib/products";

export function OrderSection({
  product,
  locale,
  dict,
  pricing
}: {
  product: Product;
  locale: Locale;
  dict: any;
  pricing?: ProductPricing | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("الدفع عند الاستلام");
  const [quantity, setQuantity] = useState(1);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const model = getProductModelNumber(product, locale);
  const { finalPrice } = getPricingDetails(product, pricing);

  const isAr = locale === "ar";
  const waNumber = dict.company.whatsappIntl.replace(/\D/g, "");

  const generateOrderId = () => {
    return `#ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponStatus("idle");
      setCouponDiscount(0);
      return;
    }
    // Hardcoded logic for DAWOD10 (10% off)
    if (code === "DAWOD10") {
      setCouponStatus("valid");
      setCouponDiscount(0.10);
    } else {
      setCouponStatus("invalid");
      setCouponDiscount(0);
    }
  };

  const totalBeforeDiscount = finalPrice !== null ? finalPrice * quantity : 0;
  const discountAmount = totalBeforeDiscount * couponDiscount;
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;

  const handleOrder = () => {
    const orderId = generateOrderId();
    
    let totalMsg = isAr ? "غير محدد" : "N/A";
    if (finalPrice !== null) {
      if (couponDiscount > 0) {
        totalMsg = `${formatPrice(totalAfterDiscount, locale)} (${isAr ? "بعد الخصم" : "after discount"})`;
      } else {
        totalMsg = formatPrice(totalBeforeDiscount, locale);
      }
    }

    const waMsg = isAr
      ? `السلام عليكم، أرغب في طلب المنتج:\n- رقم الطلب: ${orderId}\n- الموديل: ${model}\n- الكمية: ${quantity}\n- الإجمالي: ${totalMsg}\n- كود الخصم: ${couponStatus === 'valid' ? couponCode + " (مفعل)" : "لا يوجد"}\n- طريقة الدفع: ${paymentMethod}`
      : `Hello, I'd like to order:\n- Order ID: ${orderId}\n- Model: ${model}\n- Quantity: ${quantity}\n- Total: ${totalMsg}\n- Coupon: ${couponStatus === 'valid' ? couponCode + " (Applied)" : "None"}\n- Payment: ${paymentMethod}`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, "_blank");
    setIsModalOpen(false);
  };

  return (
    <div className={styles.orderSection}>
      <button className={styles.orderBtn} onClick={() => setIsModalOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        {isAr ? "اطلب عبر واتساب" : "Order via WhatsApp"}
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{isAr ? "إكمال الطلب عبر واتساب" : "Complete WhatsApp Order"}</h3>
              <button className={styles.closeModal} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>{isAr ? "الكمية المطلوبة" : "Quantity"}</label>
                <div className={styles.quantitySelector}>
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>{isAr ? "كود الخصم (إن وجد)" : "Coupon Code (Optional)"}</label>
                <div className={styles.couponRow}>
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponStatus("idle");
                      setCouponDiscount(0);
                    }} 
                    placeholder={isAr ? "أدخل الكود هنا" : "Enter code"}
                    className={`${styles.couponInput} ${couponStatus === 'valid' ? styles.couponValid : ''} ${couponStatus === 'invalid' ? styles.couponInvalid : ''}`}
                  />
                  <button type="button" className={styles.couponBtn} onClick={handleApplyCoupon}>
                    {isAr ? "تطبيق" : "Apply"}
                  </button>
                </div>
                {couponStatus === "valid" && <span className={styles.couponSuccessMsg}>{isAr ? `تم تفعيل الخصم (${couponDiscount * 100}%) 🎉` : `Discount applied (${couponDiscount * 100}%) 🎉`}</span>}
                {couponStatus === "invalid" && <span className={styles.couponErrorMsg}>{isAr ? "كود الخصم غير صحيح" : "Invalid coupon code"}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>{isAr ? "طريقة الدفع" : "Payment Method"}</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="payment" value={isAr ? "الدفع عند الاستلام" : "Cash on Delivery"} checked={paymentMethod === (isAr ? "الدفع عند الاستلام" : "Cash on Delivery")} onChange={(e) => setPaymentMethod(e.target.value)} />
                    {isAr ? "الدفع عند الاستلام 💵" : "Cash on Delivery 💵"}
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="payment" value={isAr ? "إنستا باي" : "InstaPay"} checked={paymentMethod === (isAr ? "إنستا باي" : "InstaPay")} onChange={(e) => setPaymentMethod(e.target.value)} />
                    {isAr ? "إنستا باي ⚡" : "InstaPay ⚡"}
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="payment" value={isAr ? "فودافون كاش" : "Vodafone Cash"} checked={paymentMethod === (isAr ? "فودافون كاش" : "Vodafone Cash")} onChange={(e) => setPaymentMethod(e.target.value)} />
                    {isAr ? "فودافون كاش 📱" : "Vodafone Cash 📱"}
                  </label>
                </div>
              </div>

              {/* Order Summary inside Modal */}
              {finalPrice !== null && (
                <div className={styles.orderSummaryBox}>
                  <div className={styles.summaryRow}>
                    <span>{isAr ? "السعر الأساسي:" : "Base Price:"}</span>
                    <span>{formatPrice(totalBeforeDiscount, locale)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className={styles.summaryRowDiscount}>
                      <span>{isAr ? "قيمة الخصم:" : "Discount:"}</span>
                      <span dir="ltr">-{formatPrice(discountAmount, locale)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRowTotal}>
                    <span>{isAr ? "الإجمالي:" : "Total:"}</span>
                    <span>{formatPrice(totalAfterDiscount, locale)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.confirmBtn} onClick={handleOrder}>
                {isAr ? "تأكيد وإرسال للواتساب" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
