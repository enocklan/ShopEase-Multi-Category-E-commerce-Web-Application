
import { supabase } from '../supabase/client'

// 1. Register a new customer
export const registerUser = async (fullName, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) throw error

  return data
}

// 2. Login using email and password
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

// 3. Login using Google
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

// 4. Logout
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

// 5. Get the current user session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  return data.session
}

// 6. Listen for authentication changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
