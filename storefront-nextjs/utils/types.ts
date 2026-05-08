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
