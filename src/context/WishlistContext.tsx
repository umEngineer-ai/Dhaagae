'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WishlistItemType {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  fabric: string;
  colors: string;
  stockQuantity?: number;
}

interface WishlistContextType {
  items: WishlistItemType[];
  addToWishlist: (item: WishlistItemType) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (item: WishlistItemType) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync from DB if user is logged in, else localStorage
  useEffect(() => {
    let isMounted = true;
    async function loadWishlist() {
      if (user) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.items) {
              setItems(data.items);
              try {
                localStorage.setItem('dhaagae_wishlist', JSON.stringify(data.items));
              } catch {
                // ignore
              }
              return;
            }
          }
        } catch {
          // ignore
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('dhaagae_wishlist');
        if (saved && isMounted) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }

    loadWishlist();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Keep localStorage updated
  const saveLocal = (newItems: WishlistItemType[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('dhaagae_wishlist', JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  const addToWishlist = async (item: WishlistItemType) => {
    if (items.some((i) => i.productId === item.productId)) return;
    const next = [...items, item];
    saveLocal(next);

    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.productId }),
        });
      } catch (err) {
        console.error('Failed to sync wishlist to server:', err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const next = items.filter((i) => i.productId !== productId);
    saveLocal(next);

    if (user) {
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to remove from server wishlist:', err);
      }
    }
  };

  const toggleWishlist = async (item: WishlistItemType) => {
    if (isInWishlist(item.productId)) {
      await removeFromWishlist(item.productId);
    } else {
      await addToWishlist(item);
    }
  };

  const clearWishlist = async () => {
    saveLocal([]);
    if (user) {
      try {
        await fetch('/api/wishlist', { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to clear server wishlist:', err);
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount: items.length,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
