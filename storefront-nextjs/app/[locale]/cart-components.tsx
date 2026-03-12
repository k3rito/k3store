'use client'

import { useCartStore, CartItem } from '@/store/cartStore'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-toast-in flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600">
      <span className="material-symbols-outlined text-lg">check_circle</span>{message}
    </div>
  )
}

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { locale } = useParams<{ locale: string }>()
  const { items, removeItem, updateQuantity, clearCart, itemCount, cartTotal, isB2B } = useCartStore()

  const getPrice = (item: CartItem) => isB2B && item.wholesale_price ? item.wholesale_price : item.price

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
            <div>
              <h2 className="text-lg font-bold">Your Cart</h2>
              <p className="text-xs text-slate-500">{itemCount()} item{itemCount() !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">shopping_cart</span>
              <h3 className="font-bold text-lg text-slate-600">Cart is empty</h3>
              <p className="text-slate-400 text-sm mt-2">Add products to start building your order.</p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">Continue Shopping</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Image */}
                  <div className="size-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name_en} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300">inventory_2</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{locale === 'ar' && item.name_ar ? item.name_ar : item.name_en}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {isB2B && item.wholesale_price && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">B2B</span>
                      )}
                      <span className="text-primary font-bold text-sm">${getPrice(item).toFixed(2)}</span>
                    </div>
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="size-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors">−</button>
                      <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="size-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors">+</button>
                    </div>
                  </div>

                  {/* Line Total + Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-sm">${(getPrice(item) * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-4 bg-slate-50 dark:bg-slate-800/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Subtotal ({itemCount()} items)</span>
              <span className="text-xl font-extrabold text-primary">${cartTotal().toFixed(2)}</span>
            </div>
            <Link href={`/${locale}/checkout`} onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all">
              <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span> Proceed to Checkout
            </Link>
            <button onClick={clearCart} className="w-full text-center text-xs text-red-500 font-bold hover:underline">Clear Cart</button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Add to Cart Button (reusable) ──
export function AddToCartButton({ product, variant = 'icon', className = '' }: {
  product: { id: string; name_en: string; name_ar?: string; price: number; wholesale_price?: number | null; image_url?: string | null }
  variant?: 'icon' | 'full'
  className?: string
}) {
  const addItem = useCartStore(s => s.addItem)
  const [showToast, setShowToast] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      price: Number(product.price),
      wholesale_price: product.wholesale_price ? Number(product.wholesale_price) : null,
      image_url: product.image_url,
    })
    setShowToast(true)
  }

  return (
    <>
      {variant === 'icon' ? (
        <button onClick={handleClick} className={`size-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/25 transition-all hover:scale-110 ${className}`} title="Add to Cart">
          <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
        </button>
      ) : (
        <button onClick={handleClick} className={`flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all ${className}`}>
          <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Add to Cart
        </button>
      )}
      {showToast && <Toast message="Added to cart!" onClose={() => setShowToast(false)} />}
    </>
  )
}

// ── Header Cart Badge (dynamic) ──
export function CartBadge({ onClick }: { onClick: () => void }) {
  const itemCount = useCartStore(s => s.itemCount)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <button onClick={onClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative group transition-colors">
      <span className="material-symbols-outlined">shopping_cart</span>
      {mounted && itemCount() > 0 && (
        <span className="absolute top-1 right-1 bg-primary text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 font-bold">
          {itemCount()}
        </span>
      )}
    </button>
  )
}
