// src/context/CartContext.tsx - Updated with Supabase
import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase, type CartItem as DBCartItem } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type CartItem = {
  id: string;
  product_id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // Load from localStorage for guests
      loadGuestCart();
    }
  }, [user]);

  async function loadCart() {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedItems: CartItem[] = (data || []).map((item: DBCartItem) => ({
        id: item.id,
        product_id: item.product_id,
        title: item.product_title,
        price: Number(item.product_price),
        image: item.product_image,
        quantity: item.quantity,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadGuestCart() {
    // For non-logged in users, use localStorage
    try {
      const saved = localStorage.getItem('guest_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
    }
  }

  function saveGuestCart(newItems: CartItem[]) {
    try {
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }

  async function addToCart(item: Omit<CartItem, 'id' | 'quantity'>) {
    if (user) {
      // Logged in user - save to database
      try {
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', item.product_id)
          .single();

        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id);

          if (error) throw error;

          setItems((prev) =>
            prev.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          );
        } else {
          // Insert new item
          const { data, error } = await supabase
            .from('cart_items')
            .insert([
              {
                user_id: user.id,
                product_id: item.product_id,
                product_title: item.title,
                product_price: item.price,
                product_image: item.image,
                quantity: 1,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          setItems((prev) => [
            ...prev,
            {
              id: data.id,
              product_id: item.product_id,
              title: item.title,
              price: item.price,
              image: item.image,
              quantity: 1,
            },
          ]);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Guest user - use localStorage
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === item.product_id);
        const newItems = existing
          ? prev.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          : [
              ...prev,
              {
                ...item,
                id: `guest-${Date.now()}`,
                quantity: 1,
              },
            ];

        saveGuestCart(newItems);
        return newItems;
      });
    }
  }

  async function removeFromCart(productId: string) {
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.product_id !== productId);
        saveGuestCart(newItems);
        return newItems;
      });
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setItems((prev) =>
          prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
        );
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      setItems((prev) => {
        const newItems = prev.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        );
        saveGuestCart(newItems);
        return newItems;
      });
    }
  }

  async function clearCart() {
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;

        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setItems([]);
      localStorage.removeItem('guest_cart');
    }
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}