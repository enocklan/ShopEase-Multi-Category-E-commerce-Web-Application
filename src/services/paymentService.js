
import { supabase } from '../supabase/client'

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
