
import { supabase } from '../supabase/client'

// Register a new customer
export const registerUser = async (fullName, phone, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) throw error
  return data
}

// Login using email and password
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Login using Google
export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) throw error
  return data
}

// Logout
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

// Get current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error
  return data.session
}

// Listen for authentication changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Request password reset email
export const requestPasswordReset = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  )

  if (error) throw error
  return data
}

// Update password from password-reset link
export const updateUserPassword = async (newPassword) => {
  if (!newPassword) {
    throw new Error('Please enter your new password.')
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

// Change password after verifying current password
export const changeUserPassword = async (
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Please enter both your current and new passwords.')
  }

  if (newPassword.length < 8) {
    throw new Error('Your new password must contain at least 8 characters.')
  }

  if (currentPassword === newPassword) {
    throw new Error(
      'Your new password must be different from your current password.'
    )
  }

  const { data, error } = await supabase.auth.updateUser({
    current_password: currentPassword,
    password: newPassword,
  })

  if (error) throw error

  return data
}


// Get all customers for the admin dashboard
export const getAdminCustomers = async () => {
  const { data, error } = await supabase.rpc('get_admin_customers')

  if (error) {
    throw new Error(error.message || 'Unable to load customers.')
  }

  return data || []
}
