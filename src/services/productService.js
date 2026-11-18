
import { supabase } from '../supabase/client'

// Get all active products
export const getProducts = async ({
  categoryId,
  search,
  sortBy = 'created_at',
  ascending = false,
  limit,
} = {}) => {
  const allowedSortFields = [
    'created_at',
    'name',
    'price',
  ]

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'created_at'

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order(safeSortBy, { ascending })

  // Filter products by category
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  // Search product names and descriptions
  if (search?.trim()) {
    const searchTerm = search.trim()
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    )
  }

  // Limit the number of products returned
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

// Get one product using its slug
export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data
}

// Get products belonging to one category
export const getProductsByCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
