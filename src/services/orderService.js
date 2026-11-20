
import { supabase } from '../supabase/client'

// Create an order using the secure Supabase database function
export const createOrder = async (cartItems, shippingAddress) => {
  const items = cartItems.map((item) => ({
    product_id: item.id,
    quantity: item.quantity,
  }))

  const { data, error } = await supabase.rpc('create_order', {
    p_items: items,
    p_shipping_address: shippingAddress,
  })

  if (error) throw error

  return data
}

// Get orders belonging to the logged-in customer
export const getMyOrders = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('Please log in to view your orders.')

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}
