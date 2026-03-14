'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface CartItemInput {
  id: string
  name_en: string
  price: number
  wholesale_price?: number | null
  quantity: number
}

interface ShippingDetails {
  full_name: string
  phone: string
  address: string
  city: string
}

export async function placeOrder(cartItems: CartItemInput[], shipping: ShippingDetails, isB2B: boolean, paymentMethod: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('You must be logged in to place an order')

  // Calculate total
  const total = cartItems.reduce((sum, item) => {
    const unitPrice = isB2B && item.wholesale_price ? item.wholesale_price : item.price
    return sum + unitPrice * item.quantity
  }, 0)

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total,
      shipping_address: {
        full_name: shipping.full_name,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
      },
      payment_method: paymentMethod,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Order creation failed:', orderError)
    throw new Error(`Failed to place order: ${orderError?.message || 'Unknown error'}`)
  }

  // 2. Insert order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: isB2B && item.wholesale_price ? item.wholesale_price : item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    console.error('Order items insertion failed:', itemsError)
    // Try to cleanup the order
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(`Failed to save order items: ${itemsError.message}`)
  }

  revalidatePath('/', 'layout')
  return { orderId: order.id }
}
