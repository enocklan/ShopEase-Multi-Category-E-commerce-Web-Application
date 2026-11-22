
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

import { supabase } from '../../supabase/client'

import {
  initiateMpesaPayment,
  reconcilePayment,
} from '../paymentService'

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Initiate M-Pesa payment
  describe('initiateMpesaPayment', () => {
    it('initiates an M-Pesa payment successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'STK Push sent successfully',
      }

      supabase.functions.invoke.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const result = await initiateMpesaPayment(
        'order-123',
        '0712345678'
      )

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'mpesa-stk-push',
        {
          body: {
            orderId: 'order-123',
            phoneNumber: '0712345678',
          },
        }
      )

      expect(result).toEqual(mockResponse)
    })

    it('throws an error when order ID is missing', async () => {
      await expect(
        initiateMpesaPayment('', '0712345678')
      ).rejects.toThrow('Order ID and phone number are required.')

      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('throws an error when phone number is missing', async () => {
      await expect(
        initiateMpesaPayment('order-123', '')
      ).rejects.toThrow('Order ID and phone number are required.')

      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('throws an error when the Edge Function fails', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Payment service unavailable' },
      })

      await expect(
        initiateMpesaPayment('order-123', '0712345678')
      ).rejects.toThrow('Payment service unavailable')
    })

    it('throws an error when the payment request is unsuccessful', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: {
          success: false,
          error: 'Order is not awaiting payment.',
        },
        error: null,
      })

      await expect(
        initiateMpesaPayment('order-123', '0712345678')
      ).rejects.toThrow('Order is not awaiting payment.')
    })
  })

  // Reconcile payment
  describe('reconcilePayment', () => {
    it('reconciles a payment successfully', async () => {
      const mockResponse = {
        success: true,
        status: 'completed',
      }

      supabase.functions.invoke.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const result = await reconcilePayment('payment-123')

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'reconcile-payment',
        {
          body: {
            paymentId: 'payment-123',
          },
        }
      )

      expect(result).toEqual(mockResponse)
    })

    it('throws an error when payment ID is missing', async () => {
      await expect(
        reconcilePayment('')
      ).rejects.toThrow('Payment ID is required.')

      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('returns pending payment without throwing an error', async () => {
      const mockResponse = {
        pending: true,
        message: 'Safaricom has not confirmed payment yet.',
      }

      supabase.functions.invoke.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const result = await reconcilePayment('payment-123')

      expect(result).toEqual(mockResponse)
    })

    it('throws an error when the reconciliation Edge Function fails', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Reconciliation service unavailable' },
      })

      await expect(
        reconcilePayment('payment-123')
      ).rejects.toThrow('Reconciliation service unavailable')
    })

    it('throws an error when reconciliation is unsuccessful', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: {
          success: false,
          error: 'Payment verification failed.',
        },
        error: null,
      })

      await expect(
        reconcilePayment('payment-123')
      ).rejects.toThrow('Payment verification failed.')
    })
  })
})
