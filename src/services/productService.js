
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


// Get all products for the admin panel (active and inactive)
export const getAdminProducts = async ({ search, status } = {}) => {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // Search by product name, description or SKU
  if (search?.trim()) {
    const searchTerm = search.trim()

    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`
    )
  }

  // Filter by active or inactive status
  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

// Activate or deactivate a product
export const updateProductStatus = async (productId, isActive) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}


// Create a new product
export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) throw error

  return data
}

// Upload a product image to Supabase Storage
export const uploadProductImage = async (file) => {
  if (!file) {
    throw new Error('Please select a product image.')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must not exceed 5MB.')
  }

  const fileExtension = file.name.split('.').pop().toLowerCase()
  const fileName = `${crypto.randomUUID()}.${fileExtension}`
  const filePath = `products/${fileName}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

