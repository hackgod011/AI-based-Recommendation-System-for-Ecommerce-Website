// @refresh reset
// src/context/WishlistContext.tsx
import { createContext, useState, useEffect, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase, type Wishlist as DBWishlistItem } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type WishlistItem = {
  id: string;
  product_id: string;
  title: string;
  price: number;
  image: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  count: number;
  loading: boolean;
};

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  useEffect(() => {
    if (user) {
      mergeAndLoadWishlist();
    } else {
      mergedRef.current = false;
      loadGuestWishlist();
    }
  }, [user]);

  async function mergeAndLoadWishlist() {
    if (!user) return;
    setLoading(true);

    try {
      // Load existing DB wishlist
      const { data: dbItems, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const dbProductIds = new Set((dbItems || []).map((i: DBWishlistItem) => i.product_id));

      // Merge guest wishlist if not yet merged this session
      if (!mergedRef.current) {
        mergedRef.current = true;
        const guestItems = loadGuestWishlistItems();

        const toInsert = guestItems.filter((g) => !dbProductIds.has(g.product_id));
        if (toInsert.length > 0) {
          await supabase.from('wishlist').insert(
            toInsert.map((g) => ({
              user_id: user.id,
              product_id: g.product_id,
              product_title: g.title,
              product_price: g.price,
              product_image: g.image,
            }))
          );
          localStorage.removeItem('guest_wishlist');
        }
      }

      // Reload final list from DB
      const { data: finalData } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      setItems(
        (finalData || []).map((item: DBWishlistItem) => ({
          id: item.id,
          product_id: item.product_id,
          title: item.product_title,
          price: Number(item.product_price),
          image: item.product_image,
        }))
      );
    } catch (err) {
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  }

  function loadGuestWishlistItems(): WishlistItem[] {
    try {
      const saved = localStorage.getItem('guest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function loadGuestWishlist() {
    setItems(loadGuestWishlistItems());
  }

  function saveGuestWishlist(newItems: WishlistItem[]) {
    try {
      localStorage.setItem('guest_wishlist', JSON.stringify(newItems));
    } catch (err) {
      console.error('Error saving guest wishlist:', err);
    }
  }

  async function logInteraction(
    productId: string,
    productTitle: string,
    productImage: string | undefined,
    action: 'wishlist' | 'remove_wishlist'
  ) {
    if (!user) return;
    try {
      await supabase.from('product_interactions').insert([
        {
          user_id: user.id,
          product_id: productId,
          product_title: productTitle,
          product_image: productImage ?? null,
          action_type: action,
        },
      ]);
    } catch (err) {
      console.error('Error logging interaction:', err);
    }
  }

  async function addToWishlist(item: Omit<WishlistItem, 'id'>) {
    if (isInWishlist(item.product_id)) return;

    if (user) {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .insert([
            {
              user_id: user.id,
              product_id: item.product_id,
              product_title: item.title,
              product_price: item.price,
              product_image: item.image,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setItems((prev) => [
          ...prev,
          { id: data.id, product_id: item.product_id, title: item.title, price: item.price, image: item.image },
        ]);
        await logInteraction(item.product_id, item.title, item.image, 'wishlist');
      } catch (err) {
        console.error('Error adding to wishlist:', err);
      }
    } else {
      const newItem: WishlistItem = { ...item, id: `guest-${Date.now()}` };
      setItems((prev) => {
        const updated = [...prev, newItem];
        saveGuestWishlist(updated);
        return updated;
      });
    }
  }

  async function removeFromWishlist(productId: string) {
    const item = items.find((i) => i.product_id === productId);
    if (!item) return;

    if (user) {
      try {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setItems((prev) => prev.filter((i) => i.product_id !== productId));
        await logInteraction(item.product_id, item.title, item.image, 'remove_wishlist');
      } catch (err) {
        console.error('Error removing from wishlist:', err);
      }
    } else {
      setItems((prev) => {
        const updated = prev.filter((i) => i.product_id !== productId);
        saveGuestWishlist(updated);
        return updated;
      });
    }
  }

  function isInWishlist(productId: string) {
    return items.some((i) => i.product_id === productId);
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        count: items.length,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
