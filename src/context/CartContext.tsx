'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartCustomization {
  color?: string;
  fabric?: string;
  sleeve?: string;
  neck?: string;
  length?: string;
  embroidery?: string;
  decorativeElements?: string;
  notes?: string;
  customizationFee?: number;
}

export interface CartItemType {
  id: string; // unique item id (e.g. prodId + size + hash)
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  size: string;
  quantity: number;
  customization?: CartCustomization;
}

interface CartContextType {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountPercent: number; discountAmount?: number } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; discountAmount?: number } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dhaagae_cart');
      if (saved) setItems(JSON.parse(saved));
      const savedCoupon = localStorage.getItem('dhaagae_coupon');
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dhaagae_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('dhaagae_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('dhaagae_coupon');
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon]);

  const addItem = (newItem: Omit<CartItemType, 'id'>) => {
    setItems((prev) => {
      const customKey = newItem.customization ? JSON.stringify(newItem.customization) : '';
      const uniqueId = `${newItem.productId}-${newItem.size}-${customKey}`;

      const existingIndex = prev.findIndex((i) => i.id === uniqueId);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, { ...newItem, id: uniqueId }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountPercent: data.coupon.discountPercent || 0,
          discountAmount: data.coupon.discountAmount,
        });
        return { success: true, message: `Coupon applied: ${data.coupon.discountPercent}% OFF!` };
      }
      return { success: false, message: data.error || 'Invalid or expired coupon code' };
    } catch {
      return { success: false, message: 'Could not validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const basePrice = item.discountPrice ?? item.price;
    const customFee = item.customization?.customizationFee ?? 0;
    return acc + (basePrice + customFee) * item.quantity;
  }, 0);

  const discount = appliedCoupon
    ? appliedCoupon.discountAmount ?? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  // Free standard shipping in Pakistan if subtotal after discount > 5000, else PKR 250
  const shipping = items.length === 0 ? 0 : subtotal - discount >= 5000 ? 0 : 250;

  const total = Math.max(0, subtotal - discount + shipping);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shipping,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
