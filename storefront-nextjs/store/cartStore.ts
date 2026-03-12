'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string          // product id
  name_en: string
  name_ar?: string
  price: number       // retail price
  wholesale_price?: number | null
  image_url?: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  isB2B: boolean
  addItem: (product: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setB2B: (isB2B: boolean) => void
  itemCount: () => number
  cartTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isB2B: false,

      addItem: (product, qty = 1) => {
        const existing = get().items.find(item => item.id === product.id)
        if (existing) {
          set({
            items: get().items.map(item =>
              item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
            ),
          })
        } else {
          set({ items: [...get().items, { ...product, quantity: qty }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(item => item.id !== productId) })
        } else {
          set({
            items: get().items.map(item =>
              item.id === productId ? { ...item, quantity } : item
            ),
          })
        }
      },

      clearCart: () => set({ items: [] }),

      setB2B: (isB2B) => set({ isB2B }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      cartTotal: () => {
        const { items, isB2B } = get()
        return items.reduce((sum, item) => {
          const unitPrice = isB2B && item.wholesale_price ? item.wholesale_price : item.price
          return sum + unitPrice * item.quantity
        }, 0)
      },
    }),
    {
      name: 'k3-store-cart',
    }
  )
)
