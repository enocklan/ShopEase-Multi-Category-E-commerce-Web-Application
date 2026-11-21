
import { supabase } from '../supabase/client'

// Initiate M-Pesa STK Push
export const initiateMpesaPayment = async (orderId, phoneNumber) => {
  if (!orderId || !phoneNumber) {
    throw new Error('Order ID and phone number are required.')
  }

  const { data, error } = await supabase.functions.invoke(
    'mpesa-stk-push',
    {
      body: {
        orderId,
        phoneNumber,
      },
    }
  )

  if (error) {
    throw new Error(
      error.message || 'Unable to initiate M-Pesa payment.'
    )
  }

  if (!data?.success) {
    throw new Error(
      data?.error || 'M-Pesa payment request was unsuccessful.'
    )
  }

  return data
}

// Reconcile a pending M-Pesa payment
export const reconcilePayment = async (paymentId) => {
  if (!paymentId) {
    throw new Error('Payment ID is required.')
  }

  const { data, error } = await supabase.functions.invoke(
    'reconcile-payment',
    {
      body: {
        paymentId,
      },
    }
  )

  if (error) {
    throw new Error(
      error.message || 'Unable to reconcile payment.'
    )
  }

  // Safaricom may not have confirmed the payment yet.
  // In that case, keep the payment pending.
  if (data?.pending) {
    return data
  }

  if (!data?.success) {
    throw new Error(
      data?.error || data?.message || 'Payment reconciliation failed.'
    )
  }

  return data
}
