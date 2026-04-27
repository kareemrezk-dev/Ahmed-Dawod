"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/lib/products";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  basePrice: number | null; // null if unpriced
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, basePrice: number | null) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalBasePrice: number;
  discountPercentage: number;
  totalAfterDiscount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ahmed-dawod-b2b-cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ahmed-dawod-b2b-cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity: number, basePrice: number | null) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.slug === product.slug);
      if (existing) {
        return prev.map((item) =>
          item.product.slug === product.slug
            ? { ...item, quantity: item.quantity + quantity, basePrice }
            : item
        );
      }
      return [...prev, { id: product.slug, product, quantity, basePrice }];
    });
    setIsCartOpen(true); // Auto open cart when adding
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Unpriced items are treated as 0 for the total, 
  // but they will be included in the WhatsApp message as "N/A" or "غير محدد"
  const totalBasePrice = items.reduce(
    (acc, item) => acc + (item.basePrice || 0) * item.quantity,
    0
  );

  // B2B Wholesale Discount Logic
  let discountPercentage = 0;
  if (totalItems >= 50) {
    discountPercentage = 0.10; // 10% discount for 50+ items
  } else if (totalItems >= 20) {
    discountPercentage = 0.05; // 5% discount for 20+ items
  }

  const totalAfterDiscount = totalBasePrice * (1 - discountPercentage);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalBasePrice,
        discountPercentage,
        totalAfterDiscount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
