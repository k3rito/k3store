'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { placeOrder } from './actions'

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { items, itemCount, cartTotal, isB2B, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
  })

  useEffect(() => setMounted(true), [])

  const getPrice = (item: any) => isB2B && item.wholesale_price ? item.wholesale_price : item.price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.address || !form.city) {
      setError('Please fill in all shipping details.'); return
    }
    setLoading(true); setError('')
    try {
      const result = await placeOrder(
        items.map(i => ({ id: i.id, name_en: i.name_en, price: i.price, wholesale_price: i.wholesale_price, quantity: i.quantity })),
        form,
        isB2B
      )
      clearCart()
      router.push(`/${locale}/checkout/success?orderId=${result.orderId}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">shopping_cart</span>
          <h2 className="text-2xl font-bold text-slate-600 mb-2">Cart is empty</h2>
          <p className="text-slate-400 mb-6">Add some products before checking out.</p>
          <Link href={`/${locale}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-primary">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-xl">medical_services</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Checkout</span>
          </Link>
          <Link href={`/${locale}`} className="flex items-center gap-1 text-sm text-primary font-bold hover:underline">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Continue Shopping
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Shipping Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_shipping</span> Shipping Details
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                      <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">call</span>
                      <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Street Address *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                    <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="123 Medical Ave, Suite 100" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">apartment</span>
                    <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="New York" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                    <span className="material-symbols-outlined text-lg">error</span>{error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Placing Order...</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">shopping_cart_checkout</span> Place Order — ${cartTotal().toFixed(2)}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span> Order Summary
                </h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[40vh] overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name_en} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-sm">inventory_2</span></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.name_en}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity} × ${getPrice(item).toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap">${(getPrice(item) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Items ({itemCount()})</span>
                  <span className="font-bold">${cartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-emerald-600 font-bold">Free</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-extrabold text-primary">${cartTotal().toFixed(2)}</span>
                </div>
                {isB2B && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
                    <span className="text-xs text-emerald-700 font-bold">B2B Wholesale pricing applied</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
