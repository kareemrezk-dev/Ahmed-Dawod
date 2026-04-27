"use client";

import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/pricing";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";
import { useState } from "react";
import styles from "./CartSidebar.module.css";
import { getProductImagePath, getProductImageAlt, getProductName } from "@/lib/products";

export function CartSidebar({ locale, dict }: { locale: Locale; dict: any }) {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalItems, totalBasePrice, discountPercentage, totalAfterDiscount, clearCart } = useCart();
  const isAr = locale === "ar";
  const waNumber = dict.company.whatsappIntl.replace(/\D/g, "");

  if (!isCartOpen) return null;

  const generateMessage = () => {
    let msg = isAr ? `*طلب عرض سعر (كميات/شركات)*\n` : `*Request for Quote (Wholesale/B2B)*\n`;
    
    msg += isAr ? `*المنتجات:*\n` : `*Products:*\n`;
    
    items.forEach((item) => {
      const priceStr = item.basePrice !== null ? formatPrice(item.basePrice, locale) : (isAr ? "غير محدد" : "N/A");
      const variantStr = item.variant ? ` (${item.variant})` : '';
      msg += `- ${item.quantity}x ${item.product.brand} ${item.product.modelNumber}${variantStr} (${priceStr})\n`;
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

    return msg;
  };

  const handleSendQuote = () => {
    const msg = generateMessage();
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyQuote = () => {
    const msg = generateMessage();
    navigator.clipboard.writeText(msg);
    // Optional: could add a tiny local state toast for "Copied!" here if desired.
  };

  const handleClearCart = () => {
    if (window.confirm(isAr ? "هل أنت متأكد من تفريغ السلة بالكامل؟" : "Are you sure you want to clear the entire cart?")) {
      clearCart();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>{isAr ? `سلة المشتريات (${totalItems})` : `B2B Cart (${totalItems})`}</h2>
          <div className={styles.headerActions}>
            {items.length > 0 && (
              <button className={styles.clearBtn} onClick={handleClearCart} aria-label="Clear Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
            <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
          </div>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <p>{isAr ? "السلة فارغة حالياً." : "Your cart is currently empty."}</p>
              <button className={styles.continueBtn} onClick={() => setIsCartOpen(false)}>
                {isAr ? "تصفح المنتجات" : "Continue Shopping"}
              </button>
            </div>
          ) : (
            <>
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
                      <div className={styles.itemNameRow}>
                        <p className={styles.itemName}>{item.product.brand} {item.product.modelNumber}</p>
                        {item.variant && <span className={styles.itemVariant}>{item.variant}</span>}
                      </div>
                      <div className={styles.itemPriceRow}>
                        <p className={styles.itemPrice}>
                          {item.basePrice !== null ? formatPrice(item.basePrice, locale) : (isAr ? "السعر عند الطلب" : "Price on request")}
                        </p>
                        {item.basePrice !== null && item.quantity > 1 && (
                          <span className={styles.itemTotal}>
                            ({isAr ? "الإجمالي:" : "Total:"} {formatPrice(item.basePrice * item.quantity, locale)})
                          </span>
                        )}
                      </div>
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

                <div className={styles.actionButtons}>
                  <button className={styles.checkoutBtn} onClick={handleSendQuote}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={styles.btnIcon}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    {isAr ? "طلب عبر واتساب" : "Request Quote"}
                  </button>
                  <button className={styles.copyBtn} onClick={handleCopyQuote} aria-label={isAr ? "نسخ التفاصيل" : "Copy Details"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
