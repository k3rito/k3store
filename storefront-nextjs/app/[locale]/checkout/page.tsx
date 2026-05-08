'use client'

import React, { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useLoading } from '@/components/providers'
import { placeOrder } from './actions'

export default function CheckoutPage() {
    const { items, cartTotal, isB2B, clearCart } = useCartStore()
    const { locale } = useParams<{ locale: string }>()
    const router = useRouter()
    const { setIsLoading } = useLoading()
    const [user, setUser] = useState<any>(null)
    const [loading, setPageLoading] = useState(true)

    // Form states
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        address: '',
        city: '',
        phone: '',
        payment_method: 'card' as 'card' | 'wire'
    })

    const supabase = createClient()

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: profile.full_name || '',
                        email: user.email || '',
                        phone: profile.phone || ''
                    }))
                }
            }
            setPageLoading(false)
        }
        checkUser()
    }, [supabase])

    if (loading) return <div className="p-20 text-center font-bold">Verifying healthcare professional session...</div>
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">shopping_cart_off</span>
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Link href={`/${locale}`} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Return to Store</Link>
            </div>
        )
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await placeOrder(
                items.map(i => ({
                    id: i.id,
                    name_en: i.name_en,
                    price: i.price,
                    wholesale_price: i.wholesale_price,
                    quantity: i.quantity
                })),
                {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city
                },
                isB2B,
                formData.payment_method
            )

            clearCart()
            router.push(`/${locale}/checkout/success?id=${result.orderId}`)
        } catch (err: any) {
            alert("Order failed: " + err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black/95 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Form */}
                <div className="space-y-8">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-4">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Shop
                    </Link>

                    <h1 className="text-4xl font-black tracking-tight">Checkout</h1>

                    <form onSubmit={handleCheckout} className="space-y-6">
                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                Shipping & Professional Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name / Clinic</label>
                                    <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all" placeholder="name@hospital.com" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address</label>
                                    <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all" placeholder="123 Medical District" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                                    <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Healthcare City" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setFormData({...formData, payment_method: 'card'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.payment_method === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                                    <span className="text-xs font-bold">Credit/Debit Card</span>
                                </button>
                                <button type="button" onClick={() => setFormData({...formData, payment_method: 'wire'})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.payment_method === 'wire' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-3xl">account_balance</span>
                                    <span className="text-xs font-bold">Bank Transfer (B2B)</span>
                                </button>
                            </div>
                        </section>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 transition-all transform active:scale-[0.98]">
                            Complete Secure Purchase
                        </button>
                    </form>
                </div>

                {/* Right: Summary */}
                <div className="lg:sticky lg:top-12 h-fit space-y-6">
                    <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full pointer-events-none"></div>
                        <h2 className="text-2xl font-black mb-8 relative z-10">Order Summary</h2>
                        <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {items.map(item => {
                                const unitPrice = isB2B && item.wholesale_price ? item.wholesale_price : item.price
                                return (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="size-14 rounded-xl bg-white/10 relative overflow-hidden flex-shrink-0">
                                            {item.image_url && <Image src={item.image_url} alt={item.name_en} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{item.name_en}</p>
                                            <p className="text-xs text-slate-400">Qty: {item.quantity} × ${unitPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="font-bold text-sm">${(unitPrice * item.quantity).toFixed(2)}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="border-t border-white/10 pt-8 space-y-3 relative z-10">
                            <div className="flex justify-between text-slate-400 text-sm font-medium">
                                <span>Subtotal</span>
                                <span>${cartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-sm font-medium">
                                <span>Shipping (Express)</span>
                                <span className="text-emerald-400 font-bold uppercase tracking-tighter">Calculated at dispatch</span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                <span className="font-bold">Total Amount</span>
                                <span className="text-3xl font-black text-primary-light">${cartTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
