
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


// Get all orders for the admin dashboard
export const getAdminOrders = async () => {
  // Fetch all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  if (!orders || orders.length === 0) return []

  // Collect unique customer IDs
  const userIds = [...new Set(orders.map((order) => order.user_id))]

  // Fetch customer profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds)

  if (profileError) throw profileError

  // Fetch purchased items for these orders
  const orderIds = orders.map((order) => order.id)

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) throw itemsError

  // Attach customer and item details to each order
  return orders.map((order) => ({
    ...order,
    customer: profiles.find(
      (profile) => profile.id === order.user_id
    ) || null,
    items: orderItems.filter(
      (item) => item.order_id === order.id
    ),
  }))
}

// Update an order's status

// Securely update an order status as an administrator
export const updateOrderStatus = async (orderId, status) => {
  if (!orderId || !status) {
    throw new Error('Order ID and status are required.')
  }

  const allowedStatuses = [
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid order status.')
  }

  const { data, error } = await supabase.rpc(
    'admin_update_order_status',
    {
      p_order_id: orderId,
      p_status: status,
    }
  )

  if (error) {
    throw new Error(error.message || 'Unable to update order status.')
  }

  return data
}


// Allow customers to cancel their own pending orders
export const cancelMyOrder = async (orderId) => {
  if (!orderId) {
    throw new Error('Order ID is required.')
  }

  const { data, error } = await supabase.rpc('cancel_my_order', {
    p_order_id: orderId,
  })

  if (error) {
    throw new Error(error.message || 'Unable to cancel this order.')
  }

  return data
}