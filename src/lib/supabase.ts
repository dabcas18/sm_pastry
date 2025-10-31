import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit_type: string;
  pieces_per_pack: number | null;
  is_active: boolean;
  baker: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  is_paid: boolean;
  is_completed: boolean;
  is_production_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};
