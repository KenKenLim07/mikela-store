export interface Product {
  id: string; // uuid
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stocks: number; // new field
  created_at?: string; // ISO timestamp
}

export interface Order {
  id: string; // uuid
  product_id?: string; // uuid
  buyer_name: string;
  payment_proof_url?: string;
  status?: string; // e.g. 'pending'
  denial_reason?: string; // reason for denied orders
  created_at?: string; // ISO timestamp
}

export type Role = 'admin' | 'user';

export interface Profile {
  id: string; // uuid
  role?: Role;
  full_name?: string;
  created_at?: string; // ISO timestamp
}

// Additional utility types for better type safety
export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stocks: number; // new field
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  stocks?: number; // new field
}

export interface CreateOrderData {
  product_id: string;
  buyer_name: string;
  payment_proof_url?: string;
  status?: string;
}

export interface UpdateOrderData {
  buyer_name?: string;
  payment_proof_url?: string;
  status?: string;
}

export interface CreateProfileData {
  role?: Role;
  full_name?: string;
}

export interface UpdateProfileData {
  role?: Role;
  full_name?: string;
}

// Supabase response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Form data types for better validation
export interface ProductFormData {
  name: string;
  description: string;
  price: string; // string for form input, will be converted to number
  image?: File;
}

export interface CheckoutFormData {
  buyer_name: string;
  product_id: string;
  payment_proof?: File;
}

// Status types for orders
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Auth types
export interface AuthUser {
  id: string;
  email?: string;
  role?: Role;
  full_name?: string;
}

// UI state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
} 