
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

  if (error) {
    throw error
  }

  return data
}
