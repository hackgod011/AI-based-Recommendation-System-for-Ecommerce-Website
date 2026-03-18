// ecommerce-frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables with validation (VITE prefix for Vite projects)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Check your .env.local file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Check your .env.local file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type User = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total_amount: number;
  shipping_address: any;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image: string;
  quantity: number;
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  type: 'upi' | 'card' | 'netbanking' | 'cash';
  upi_id?: string;
  card_last4?: string;
  card_brand?: string;
  card_expiry?: string;
  bank_name?: string;
  is_default: boolean;
  created_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image: string;
  created_at: string;
};

export type ProductInteraction = {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  action_type: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'wishlist' | 'remove_wishlist';
  created_at: string;
};

export type Recommendation = {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  score?: number;
  reason?: string;
  created_at: string;
};