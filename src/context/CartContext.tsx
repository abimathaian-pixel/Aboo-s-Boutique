'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface LocalCartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  cart: LocalCartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aboo_guest_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchDbCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cartItems || []);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (user) {
      fetchDbCart();
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setCart(JSON.parse(stored));
        } else {
          setCart([]);
        }
      } catch {
        setCart([]);
      }
    }
  }, [user]);

  const saveLocalCart = (items: LocalCartItem[]) => {
    setCart(items);
    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  };

  const addToCart = async (product: Product, size: string, color: string, quantity = 1) => {
    if (user) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, size, color, quantity }),
        });
        if (res.ok) {
          await fetchDbCart();
          showToast(`Added ${product.name} (${size}) to cart`);
          setIsCartOpen(true);
        } else {
          showToast('Could not add product to cart', 'error');
        }
      } catch {
        showToast('Failed to update cart', 'error');
      }
    } else {
      // Guest cart
      const existingIndex = cart.findIndex(
        (i) => i.productId === product.id && i.size === size && i.color === color
      );

      let updated = [...cart];
      if (existingIndex > -1) {
        updated[existingIndex].quantity += quantity;
      } else {
        const newItem: LocalCartItem = {
          id: `${product.id}-${size}-${color}-${Date.now()}`,
          productId: product.id,
          product,
          size,
          color,
          quantity,
        };
        updated.push(newItem);
      }
      saveLocalCart(updated);
      showToast(`Added ${product.name} to bag`);
      setIsCartOpen(true);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (user) {
      try {
        const res = await fetch(`/api/cart`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, quantity }),
        });
        if (res.ok) {
          await fetchDbCart();
        }
      } catch {
        showToast('Failed to update item quantity', 'error');
      }
    } else {
      const updated = cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      saveLocalCart(updated);
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      try {
        const res = await fetch(`/api/cart?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchDbCart();
          showToast('Item removed from cart', 'info');
        }
      } catch {
        showToast('Failed to remove item', 'error');
      }
    } else {
      const updated = cart.filter((item) => item.id !== id);
      saveLocalCart(updated);
      showToast('Item removed from bag', 'info');
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!user) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return total + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchDbCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
