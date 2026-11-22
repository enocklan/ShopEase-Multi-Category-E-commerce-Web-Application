
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../supabase/client'

import {
  createOrder,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
  cancelMyOrder,
} from '../orderService'

describe('orderService', () => {
  let query

  beforeEach(() => {
    vi.clearAllMocks()

    query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      in: vi.fn(),
    }

    Object.values(query).forEach((method) => {
      method.mockReturnValue(query)
    })

    supabase.from.mockReturnValue(query)
  })

  describe('createOrder', () => {
    it('creates an order successfully', async () => {
      const cartItems = [
        { id: 'product-1', quantity: 2 },
        { id: 'product-2', quantity: 1 },
      ]

      const shippingAddress = {
        fullName: 'John Doe',
        county: 'Nairobi',
      }

      const orderResponse = {
        success: true,
        order_id: 'order-1',
      }

      supabase.functions.invoke.mockResolvedValue({
        data: orderResponse,
        error: null,
      })

      const result = await createOrder(cartItems, shippingAddress)

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'create-order',
        {
          body: {
            items: [
              { product_id: 'product-1', quantity: 2 },
              { product_id: 'product-2', quantity: 1 },
            ],
            shippingAddress,
          },
        }
      )

      expect(result).toEqual(orderResponse)
    })

    it('throws an error when the Edge Function fails', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      })

      await expect(
        createOrder([], {})
      ).rejects.toThrow('Network error')
    })

    it('throws an error when the order response is unsuccessful', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: {
          success: false,
          error: 'Unable to create order',
        },
        error: null,
      })

      await expect(
        createOrder([], {})
      ).rejects.toThrow('Unable to create order')
    })
  })

  describe('getMyOrders', () => {
    it('returns orders belonging to the logged-in customer', async () => {
      const orders = [
        { id: 'order-1', user_id: 'user-1' },
      ]

      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-1' },
        },
        error: null,
      })

      query.order.mockResolvedValue({
        data: orders,
        error: null,
      })

      const result = await getMyOrders()

      expect(supabase.from).toHaveBeenCalledWith('orders')
      expect(query.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(query.order).toHaveBeenCalledWith(
        'created_at',
        { ascending: false }
      )
      expect(result).toEqual(orders)
    })

    it('throws an error when the user is not logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await expect(getMyOrders()).rejects.toThrow(
        'Please log in to view your orders.'
      )
    })

    it('throws an error when getting the logged-in user fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Authentication error'),
      })

      await expect(getMyOrders()).rejects.toThrow(
        'Authentication error'
      )
    })

    it('throws an error when fetching customer orders fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      })

      query.order.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      })

      await expect(getMyOrders()).rejects.toThrow('Database error')
    })
  })

  describe('getAdminOrders', () => {
    it('returns an empty array when no orders exist', async () => {
      query.order.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAdminOrders()

      expect(result).toEqual([])
      expect(supabase.from).toHaveBeenCalledWith('orders')
    })

    it('returns orders with customer and item details', async () => {
      const orders = [
        {
          id: 'order-1',
          user_id: 'user-1',
        },
      ]

      const profiles = [
        {
          id: 'user-1',
          full_name: 'John Doe',
          phone: '0712345678',
        },
      ]

      const orderItems = [
        {
          id: 'item-1',
          order_id: 'order-1',
          product_name: 'Laptop',
          quantity: 1,
        },
      ]

      query.order.mockResolvedValue({
        data: orders,
        error: null,
      })

      query.in
        .mockResolvedValueOnce({
          data: profiles,
          error: null,
        })
        .mockResolvedValueOnce({
          data: orderItems,
          error: null,
        })

      const result = await getAdminOrders()

      expect(supabase.from).toHaveBeenCalledWith('orders')
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(supabase.from).toHaveBeenCalledWith('order_items')

      expect(result).toEqual([
        {
          ...orders[0],
          customer: profiles[0],
          items: orderItems,
        },
      ])
    })

    it('throws an error when fetching orders fails', async () => {
      query.order.mockResolvedValue({
        data: null,
        error: new Error('Orders database error'),
      })

      await expect(getAdminOrders()).rejects.toThrow(
        'Orders database error'
      )
    })

    it('throws an error when fetching customer profiles fails', async () => {
      query.order.mockResolvedValue({
        data: [{ id: 'order-1', user_id: 'user-1' }],
        error: null,
      })

      query.in.mockResolvedValueOnce({
        data: null,
        error: new Error('Profiles database error'),
      })

      await expect(getAdminOrders()).rejects.toThrow(
        'Profiles database error'
      )
    })

    it('throws an error when fetching order items fails', async () => {
      query.order.mockResolvedValue({
        data: [{ id: 'order-1', user_id: 'user-1' }],
        error: null,
      })

      query.in
        .mockResolvedValueOnce({
          data: [{ id: 'user-1', full_name: 'John Doe' }],
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: new Error('Order items database error'),
        })

      await expect(getAdminOrders()).rejects.toThrow(
        'Order items database error'
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('updates an order status successfully', async () => {
      const updatedOrder = {
        id: 'order-1',
        status: 'processing',
      }

      supabase.rpc.mockResolvedValue({
        data: updatedOrder,
        error: null,
      })

      const result = await updateOrderStatus(
        'order-1',
        'processing'
      )

      expect(supabase.rpc).toHaveBeenCalledWith(
        'admin_update_order_status',
        {
          p_order_id: 'order-1',
          p_status: 'processing',
        }
      )

      expect(result).toEqual(updatedOrder)
    })

    it('throws an error when order ID or status is missing', async () => {
      await expect(
        updateOrderStatus('', 'processing')
      ).rejects.toThrow('Order ID and status are required.')
    })

    it('rejects an invalid order status', async () => {
      await expect(
        updateOrderStatus('order-1', 'pending')
      ).rejects.toThrow('Invalid order status.')
    })

    it('throws an error when the status update fails', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Unable to update order'),
      })

      await expect(
        updateOrderStatus('order-1', 'processing')
      ).rejects.toThrow('Unable to update order')
    })
  })

  describe('cancelMyOrder', () => {
    it('cancels an order successfully', async () => {
      const cancelledOrder = {
        id: 'order-1',
        status: 'cancelled',
      }

      supabase.rpc.mockResolvedValue({
        data: cancelledOrder,
        error: null,
      })

      const result = await cancelMyOrder('order-1')

      expect(supabase.rpc).toHaveBeenCalledWith(
        'cancel_my_order',
        {
          p_order_id: 'order-1',
        }
      )

      expect(result).toEqual(cancelledOrder)
    })

    it('throws an error when the order ID is missing', async () => {
      await expect(
        cancelMyOrder('')
      ).rejects.toThrow('Order ID is required.')
    })

    it('throws an error when cancellation fails', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Unable to cancel order'),
      })

      await expect(
        cancelMyOrder('order-1')
      ).rejects.toThrow('Unable to cancel order')
    })
  })
})
