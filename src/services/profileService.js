
import { supabase } from '../supabase/client'

// Get the customer's profile
export const getMyProfile = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError

  if (!user) {
    throw new Error('You must be logged in.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, phone, role, deleted_at, created_at, updated_at'
    )
    .eq('id', user.id)
    .single()

  if (error) throw error

  return {
    ...data,
    email: user.email,
  }
}

// Update customer profile
export const updateMyProfile = async (fullName, phone) => {
  const { data, error } = await supabase.rpc('update_my_profile', {
    p_full_name: fullName,
    p_phone: phone,
  })

  if (error) throw error

  return data
}

// Soft-delete customer account
export const deactivateMyAccount = async (currentPassword) => {
  if (!currentPassword) {
    throw new Error('Please enter your current password.')
  }

  // Get the currently logged-in customer
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError

  if (!user?.email) {
    throw new Error('No authenticated account was found.')
  }

  // Verify current password
  const { error: verifyError } =
    await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

  if (verifyError) {
    throw new Error('Your current password is incorrect.')
  }

  // Mark the profile as deactivated in the database
  const { error: deactivateError } = await supabase.rpc(
    'deactivate_my_account'
  )

  if (deactivateError) throw deactivateError

  // Sign out after successful deactivation
  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) throw signOutError

  return true
}
