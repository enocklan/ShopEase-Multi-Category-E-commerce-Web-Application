
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}))

import { supabase } from '../../supabase/client'

import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getProductsByCategory,
  getAdminProducts,
  updateProductStatus,
  createProduct,
  uploadProductImage,
} from '../productService'

describe('productService', () => {
  let query

  beforeEach(() => {
    vi.clearAllMocks()

    query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      or: vi.fn(),
      limit: vi.fn(),
      maybeSingle: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
      single: vi.fn(),
    }

    Object.values(query).forEach((method) => {
      method.mockReturnValue(query)
    })

    supabase.from.mockReturnValue(query)
  })

  describe('getProducts', () => {
    it('returns active products', async () => {
      const products = [{ id: '1', name: 'Laptop' }]

      query.limit.mockResolvedValue({
        data: products,
        error: null,
      })

      const result = await getProducts({ limit: 10 })

      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(query.eq).toHaveBeenCalledWith('is_active', true)
      expect(query.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(products)
    })

    it('filters products by category and search term', async () => {
      query.limit.mockResolvedValue({
        data: [],
        error: null,
      })

      await getProducts({
        categoryId: 'cat-1',
        search: ' laptop ',
        limit: 5,
      })

      expect(query.eq).toHaveBeenCalledWith('category_id', 'cat-1')
      expect(query.or).toHaveBeenCalledWith(
        'name.ilike.%laptop%,description.ilike.%laptop%'
      )
      expect(query.limit).toHaveBeenCalledWith(5)
    })

    it('uses a safe sort field when an invalid field is supplied', async () => {
      query.limit.mockResolvedValue({
        data: [],
        error: null,
      })

      await getProducts({ sortBy: 'invalid_column', limit: 10 })

      expect(query.order).toHaveBeenCalledWith(
        'created_at',
        { ascending: false }
      )
    })

    it('throws an error when fetching products fails', async () => {
      const error = new Error('Database error')

      query.limit.mockResolvedValue({
        data: null,
        error,
      })

      await expect(getProducts({ limit: 10 })).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('getProductBySlug', () => {
    it('returns an active product by slug', async () => {
      const product = { id: '1', slug: 'gaming-laptop' }

      query.maybeSingle.mockResolvedValue({
        data: product,
        error: null,
      })

      const result = await getProductBySlug('gaming-laptop')

      expect(query.eq).toHaveBeenCalledWith('slug', 'gaming-laptop')
      expect(result).toEqual(product)
    })
  })

  describe('getFeaturedProducts', () => {
    it('returns featured active products', async () => {
      const products = [{ id: '1', is_featured: true }]

      query.limit.mockResolvedValue({
        data: products,
        error: null,
      })

      const result = await getFeaturedProducts(4)

      expect(query.eq).toHaveBeenCalledWith('is_featured', true)
      expect(query.limit).toHaveBeenCalledWith(4)
      expect(result).toEqual(products)
    })
  })

  describe('getProductsByCategory', () => {
    it('returns active products in a category', async () => {
      query.order.mockResolvedValue({
        data: [{ id: '1' }],
        error: null,
      })

      const result = await getProductsByCategory('cat-1')

      expect(query.eq).toHaveBeenCalledWith('category_id', 'cat-1')
      expect(result).toEqual([{ id: '1' }])
    })
  })

  describe('getAdminProducts', () => {
    it('filters admin products by active status', async () => {
      query.eq.mockResolvedValue({
        data: [{ id: '1', is_active: true }],
        error: null,
      })

      const result = await getAdminProducts({ status: 'active' })

      expect(query.eq).toHaveBeenCalledWith('is_active', true)
      expect(result).toEqual([{ id: '1', is_active: true }])
    })

    it('searches products by name, description and SKU', async () => {
      query.or.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAdminProducts({ search: 'phone' })

      expect(query.or).toHaveBeenCalledWith(
        'name.ilike.%phone%,description.ilike.%phone%,sku.ilike.%phone%'
      )
    })
  })

  describe('updateProductStatus', () => {
    it('updates a product active status', async () => {
      const updatedProduct = { id: '1', is_active: false }

      query.single.mockResolvedValue({
        data: updatedProduct,
        error: null,
      })

      const result = await updateProductStatus('1', false)

      expect(query.update).toHaveBeenCalledWith({
        is_active: false,
      })
      expect(query.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedProduct)
    })
  })

  describe('createProduct', () => {
    it('creates a new product', async () => {
      const productData = { name: 'Laptop', price: 50000 }
      const createdProduct = { id: '1', ...productData }

      query.single.mockResolvedValue({
        data: createdProduct,
        error: null,
      })

      const result = await createProduct(productData)

      expect(query.insert).toHaveBeenCalledWith([productData])
      expect(result).toEqual(createdProduct)
    })
  })

  describe('uploadProductImage', () => {
    it('rejects when no image is selected', async () => {
      await expect(uploadProductImage(null)).rejects.toThrow(
        'Please select a product image.'
      )
    })

    it('rejects unsupported image formats', async () => {
      const file = new File(['image'], 'document.pdf', {
        type: 'application/pdf',
      })

      await expect(uploadProductImage(file)).rejects.toThrow(
        'Only JPG, PNG, and WebP images are allowed.'
      )
    })

    it('rejects images larger than 5MB', async () => {
      const file = {
        name: 'large.png',
        type: 'image/png',
        size: 6 * 1024 * 1024,
      }

      await expect(uploadProductImage(file)).rejects.toThrow(
        'Image size must not exceed 5MB.'
      )
    })
  })
})
