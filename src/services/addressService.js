
import { supabase } from '../supabase/client'

// Save a customer's delivery address
export const saveAddress = async (userId, address) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      full_name: address.fullName.trim(),
      phone: address.phone.trim(),
      county: address.county,
      city: address.city.trim(),
      street_address: address.streetAddress.trim(),
      postal_code: address.postalCode.trim() || null,
      is_default: false,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Get all addresses belonging to a customer
export const getUserAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
