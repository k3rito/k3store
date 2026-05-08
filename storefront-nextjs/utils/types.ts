export interface Category {
  id: string
  name_en: string
  name_ar?: string
  image_url?: string
  status?: 'active' | 'inactive'
  display_order?: number
}

export interface Product {
  id: string
  name_en: string
  name_ar?: string
  description_en?: string
  description_ar?: string
  price: number
  wholesale_price?: number | null
  stock?: number
  image_url?: string | null
  status?: 'active' | 'inactive'
  category_id?: string
  rating_avg?: number
  reviews_count?: number
  categories?: {
    name_en: string
    name_ar?: string
  }
}

export interface Profile {
  id: string
  full_name: string | null
  email: string
  role: 'super_admin' | 'supervisor' | 'employee' | 'editor' | 'user'
  status: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface Order {
  id: string
  user_id?: string | null
  total_amount: number
  status: 'pending' | 'completed' | 'cancelled'
  is_b2b?: boolean
  customer_name: string | null
  customer_email: string | null
  customer_phone?: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
  }
}
