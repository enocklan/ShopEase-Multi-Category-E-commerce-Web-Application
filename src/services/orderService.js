
import { supabase } from '../supabase/client'

// Create an order through the secure Supabase Edge Function
export const createOrder = async (cartItems, shippingAddress) => {
  // Prepare cart items for the backend
  const items = cartItems.map((item) => ({
    product_id: item.id,
    quantity: item.quantity,
  }))

  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('create-order', {
    body: {
      items,
      shippingAddress,
    },
  })

  // Handle Edge Function errors
  if (error) {
    throw new Error(error.message || 'Unable to create your order.')
  }

  // Handle unsuccessful responses
  if (!data?.success) {
    throw new Error(data?.error || 'Unable to create your order.')
  }

  // Return order details
  return data
}

// Get orders belonging to the logged-in customer
export const getMyOrders = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError

  if (!user) {
    throw new Error('Please log in to view your orders.')
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}
