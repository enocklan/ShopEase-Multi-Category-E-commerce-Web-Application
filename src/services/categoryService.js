
import { supabase } from '../supabase/client'

// Get all active categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

// Get one category using its slug
export const getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

// Get a category and its active products
export const getCategoryWithProducts = async (categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      products (*)
    `)
    .eq('id', categoryId)
    .eq('is_active', true)
    .eq('products.is_active', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}


// Get all categories for the admin dashboard
export const getAdminCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

// Create a new category
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single()

  if (error) throw error

  return data
}

// Update category details
export const updateCategory = async (categoryId, categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) throw error

  return data
}

// Activate or deactivate a category
export const updateCategoryStatus = async (categoryId, isActive) => {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) throw error

  return data
}

