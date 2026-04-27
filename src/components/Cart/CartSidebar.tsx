"use client";

import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/pricing";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";
import { useState } from "react";
import styles from "./CartSidebar.module.css";
import { getProductImagePath, getProductImageAlt, getProductName } from "@/lib/products";

export function CartSidebar({ locale, dict }: { locale: Locale; dict: any }) {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalItems, totalBasePrice, discountPercentage, totalAfterDiscount } = useCart();
  const [companyName, setCompanyName] = useState("");
  const isAr = locale === "ar";
  const waNumber = dict.company.whatsappIntl.replace(/\D/g, "");

  if (!isCartOpen) return null;

  const handleSendQuote = () => {
    let msg = isAr ? `*طلب عرض سعر (كميات/شركات)*\n` : `*Request for Quote (Wholesale/B2B)*\n`;
    if (companyName) {
      msg += isAr ? `الشركة: ${companyName}\n\n` : `Company: ${companyName}\n\n`;
    }
    
    msg += isAr ? `*المنتجات:*\n` : `*Products:*\n`;
    
    items.forEach((item) => {
      const priceStr = item.basePrice !== null ? formatPrice(item.basePrice, locale) : (isAr ? "غير محدد" : "N/A");
      msg += `- ${item.quantity}x ${item.product.modelNumber} (${priceStr})\n`;
    });

    msg += `\n------------------\n`;
    msg += isAr ? `إجمالي الكمية: ${totalItems} قطعة\n` : `Total Quantity: ${totalItems} pcs\n`;
    
    if (totalBasePrice > 0) {
      msg += isAr ? `السعر الأساسي: ${formatPrice(totalBasePrice, locale)}\n` : `Base Price: ${formatPrice(totalBasePrice, locale)}\n`;
      if (discountPercentage > 0) {
        msg += isAr ? `خصم الكمية المطبق (${discountPercentage * 100}%): -${formatPrice(totalBasePrice * discountPercentage, locale)}\n` : `Volume Discount Applied (${discountPercentage * 100}%): -${formatPrice(totalBasePrice * discountPercentage, locale)}\n`;
      }
      msg += isAr ? `*الإجمالي النهائي:* ${formatPrice(totalAfterDiscount, locale)}\n` : `*Final Total:* ${formatPrice(totalAfterDiscount, locale)}\n`;
    }

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const nextTier = discountPercentage === 0 ? 20 : discountPercentage === 0.05 ? 50 : 0;
  const itemsNeeded = nextTier - totalItems;

  return (
    <>
      <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>{isAr ? "سلة المشتريات (للشركات)" : "B2B Cart"}</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>{isAr ? "السلة فارغة حالياً." : "Your cart is currently empty."}</p>
            </div>
          ) : (
            <>
              {nextTier > 0 && (
                <div className={styles.gamificationBox}>
                  {isAr 
                    ? `أضف ${itemsNeeded} قطعة إضافية للحصول على خصم ${nextTier === 20 ? '5%' : '10%'}!` 
                    : `Add ${itemsNeeded} more items to get a ${nextTier === 20 ? '5%' : '10%'} discount!`}
                </div>
              )}

              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={getProductImagePath(item.product)} 
                        alt={getProductImageAlt(item.product)} 
                        width={60} 
                        height={60} 
                        className={styles.img}
                        unoptimized={getProductImagePath(item.product).endsWith('.svg')}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>{item.product.brand} {item.product.modelNumber}</p>
                      <p className={styles.itemPrice}>
                        {item.basePrice !== null ? formatPrice(item.basePrice, locale) : (isAr ? "السعر عند الطلب" : "Price on request")}
                      </p>
                      <div className={styles.quantityControls}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.summarySection}>
                <div className={styles.companyInput}>
                  <label>{isAr ? "اسم الشركة (اختياري)" : "Company Name (Optional)"}</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    placeholder={isAr ? "أدخل اسم الشركة" : "Enter company name"}
                  />
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>{isAr ? "إجمالي الكمية:" : "Total Quantity:"}</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>{isAr ? "السعر الأساسي:" : "Base Price:"}</span>
                    <span>{formatPrice(totalBasePrice, locale)}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>{isAr ? `خصم الكمية (${discountPercentage * 100}%):` : `Volume Discount (${discountPercentage * 100}%):`}</span>
                      <span>-{formatPrice(totalBasePrice * discountPercentage, locale)}</span>
                    </div>
                  )}
                  <div className={`${styles.summaryRow} ${styles.finalTotalRow}`}>
                    <span>{isAr ? "الإجمالي النهائي:" : "Final Total:"}</span>
                    <span>{formatPrice(totalAfterDiscount, locale)}</span>
                  </div>
                </div>

                <button className={styles.checkoutBtn} onClick={handleSendQuote}>
                  {isAr ? "طلب عرض سعر عبر واتساب" : "Request Quote via WhatsApp"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
