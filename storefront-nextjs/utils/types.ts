export type AppRole = 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'customer';

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  display_order: number;
}

export interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string;
  status: 'active' | 'draft' | 'out_of_stock';
  rating_avg?: number;
  reviews_count?: number;
  categories?: Category | Category[];
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  status: 'active' | 'suspended' | 'on_leave';
  avatar_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  profile_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer_name: string;
  customer_email: string;
  created_at: string;
  profiles?: Profile | Profile[];
}

export interface Review {
  id: string;
  product_id: string;
  profile_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: Profile | Profile[];
  products?: Product | Product[];
}
