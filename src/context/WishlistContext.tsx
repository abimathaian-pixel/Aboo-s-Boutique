'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const LOCAL_WISHLIST_KEY = 'aboo_guest_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchDbWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistProducts(data.items.map((i: { product: Product }) => i.product));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchDbWishlist();
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
        if (stored) {
          setWishlistProducts(JSON.parse(stored));
        } else {
          setWishlistProducts([]);
        }
      } catch {
        setWishlistProducts([]);
      }
    }
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    const isPresent = wishlistProducts.some((p) => p.id === product.id);

    if (user) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        if (res.ok) {
          await fetchDbWishlist();
          showToast(
            isPresent ? `Removed from wishlist` : `Added ${product.name} to wishlist`
          );
        }
      } catch {
        showToast('Failed to update wishlist', 'error');
      }
    } else {
      let updated: Product[];
      if (isPresent) {
        updated = wishlistProducts.filter((p) => p.id !== product.id);
        showToast('Removed from wishlist');
      } else {
        updated = [...wishlistProducts, product];
        showToast(`Added ${product.name} to wishlist`);
      }
      setWishlistProducts(updated);
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistProducts.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: wishlistProducts.map((p) => p.id),
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
