
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
