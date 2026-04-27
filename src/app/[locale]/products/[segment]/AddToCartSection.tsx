"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import type { Product } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import { formatPrice, getPricingDetails, type ProductPricing } from "@/lib/pricing";
import styles from "./AddToCartSection.module.css";

export function AddToCartSection({
  product,
  locale,
  pricing
}: {
  product: Product;
  locale: Locale;
  pricing?: ProductPricing | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { addToCart, isCartOpen } = useCart();
  const { finalPrice } = getPricingDetails(product, pricing);
  const isAr = locale === "ar";

  useEffect(() => {
    const handleSize = (e: any) => setVariant(e.detail);
    window.addEventListener("sizeSelected", handleSize);
    return () => window.removeEventListener("sizeSelected", handleSize);
  }, []);

  const handleAdd = () => {
    addToCart(product, quantity, finalPrice, variant || undefined);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className={styles.addToCartContainer}>
      <p className={styles.title}>{isAr ? "للشركات والكميات (عرض سعر):" : "For B2B & Wholesale (Quote):"}</p>
      
      <div className={styles.controlsRow}>
        <div className={styles.quantitySelector}>
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span className={styles.quantityValue}>{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <button className={`${styles.addBtn} ${showToast ? styles.successBtn : ''}`} onClick={handleAdd}>
          {showToast ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.toastIcon}>
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
          {showToast ? (isAr ? "تمت الإضافة!" : "Added!") : (isAr ? "أضف لعرض السعر" : "Add to Quote")}
        </button>
      </div>
      <p className={styles.hint}>
        {isAr 
          ? "أضف أكثر من منتج للسلة للحصول على خصومات الكمية التلقائية." 
          : "Add multiple products to cart to unlock automatic volume discounts."}
      </p>
    </div>
  );
}
