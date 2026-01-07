import { useState } from 'react';

type WishlistItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addToWishlist = (item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some(i => i.id === id);
  };

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    count: items.length
  };
}