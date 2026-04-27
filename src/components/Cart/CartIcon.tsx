"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import styles from "./CartIcon.module.css";

export function CartIcon() {
  const { totalItems, setIsCartOpen } = useCart();
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <button 
      className={`${styles.cartIconWrapper} ${isBouncing ? styles.bounce : ''}`} 
      onClick={() => setIsCartOpen(true)}
      aria-label="Open Cart"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {totalItems > 0 && (
        <span className={styles.badge}>{totalItems > 99 ? '99+' : totalItems}</span>
      )}
    </button>
  );
}
