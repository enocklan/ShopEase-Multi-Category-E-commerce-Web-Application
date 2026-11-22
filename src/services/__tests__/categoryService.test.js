
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../supabase/client'

import {
  getCategories,
  getCategoryBySlug,
  getCategoryWithProducts,
  getAdminCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} from '../categoryService'

describe('categoryService', () => {
  let query

  beforeEach(() => {
    vi.clearAllMocks()

    query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      maybeSingle: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      single: vi.fn(),
    }

    Object.values(query).forEach((method) => {
      method.mockReturnValue(query)
    })

    supabase.from.mockReturnValue(query)
  })

  describe('getCategories', () => {
    it('returns all active categories', async () => {
      const categories = [
        { id: '1', name: 'Electronics', is_active: true },
      ]

      query.order.mockResolvedValue({
        data: categories,
        error: null,
      })

      const result = await getCategories()

      expect(supabase.from).toHaveBeenCalledWith('categories')
      expect(query.eq).toHaveBeenCalledWith('is_active', true)
      expect(query.order).toHaveBeenCalledWith(
        'name',
        { ascending: true }
      )
      expect(result).toEqual(categories)
    })

    it('throws an error when fetching categories fails', async () => {
      const error = new Error('Database error')

      query.order.mockResolvedValue({
        data: null,
        error,
      })

      await expect(getCategories()).rejects.toThrow('Database error')
    })
  })

  describe('getCategoryBySlug', () => {
    it('returns an active category by slug', async () => {
      const category = {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
      }

      query.maybeSingle.mockResolvedValue({
        data: category,
        error: null,
      })

      const result = await getCategoryBySlug('electronics')

      expect(query.eq).toHaveBeenCalledWith('slug', 'electronics')
      expect(query.eq).toHaveBeenCalledWith('is_active', true)
      expect(result).toEqual(category)
    })

    it('throws an error when fetching a category fails', async () => {
      const error = new Error('Category not found')

      query.maybeSingle.mockResolvedValue({
        data: null,
        error,
      })

      await expect(
        getCategoryBySlug('electronics')
      ).rejects.toThrow('Category not found')
    })
  })

  describe('getCategoryWithProducts', () => {
    it('returns a category with its active products', async () => {
      const category = {
        id: '1',
        name: 'Electronics',
        products: [
          { id: 'p1', name: 'Laptop', is_active: true },
        ],
      }

      query.maybeSingle.mockResolvedValue({
        data: category,
        error: null,
      })

      const result = await getCategoryWithProducts('1')

      expect(query.eq).toHaveBeenCalledWith('id', '1')
      expect(query.eq).toHaveBeenCalledWith('is_active', true)
      expect(query.eq).toHaveBeenCalledWith('products.is_active', true)
      expect(result).toEqual(category)
    })

    it('throws an error when fetching category products fails', async () => {
      const error = new Error('Unable to fetch category products')

      query.maybeSingle.mockResolvedValue({
        data: null,
        error,
      })

      await expect(
        getCategoryWithProducts('1')
      ).rejects.toThrow('Unable to fetch category products')
    })
  })

  describe('getAdminCategories', () => {
    it('returns all categories for the admin dashboard', async () => {
      const categories = [
        { id: '1', name: 'Electronics', is_active: true },
        { id: '2', name: 'Fashion', is_active: false },
      ]

      query.order.mockResolvedValue({
        data: categories,
        error: null,
      })

      const result = await getAdminCategories()

      expect(supabase.from).toHaveBeenCalledWith('categories')
      expect(query.order).toHaveBeenCalledWith(
        'created_at',
        { ascending: false }
      )
      expect(result).toEqual(categories)
    })

    it('throws an error when fetching admin categories fails', async () => {
      const error = new Error('Unable to fetch categories')

      query.order.mockResolvedValue({
        data: null,
        error,
      })

      await expect(getAdminCategories()).rejects.toThrow(
        'Unable to fetch categories'
      )
    })
  })

  describe('createCategory', () => {
    it('creates a new category', async () => {
      const categoryData = {
        name: 'Electronics',
        slug: 'electronics',
      }

      const createdCategory = {
        id: '1',
        ...categoryData,
      }

      query.single.mockResolvedValue({
        data: createdCategory,
        error: null,
      })

      const result = await createCategory(categoryData)

      expect(query.insert).toHaveBeenCalledWith([categoryData])
      expect(result).toEqual(createdCategory)
    })

    it('throws an error when category creation fails', async () => {
      const error = new Error('Unable to create category')

      query.single.mockResolvedValue({
        data: null,
        error,
      })

      await expect(
        createCategory({ name: 'Electronics' })
      ).rejects.toThrow('Unable to create category')
    })
  })

  describe('updateCategory', () => {
    it('updates category details', async () => {
      const categoryData = {
        name: 'Updated Electronics',
      }

      const updatedCategory = {
        id: '1',
        name: 'Updated Electronics',
      }

      query.single.mockResolvedValue({
        data: updatedCategory,
        error: null,
      })

      const result = await updateCategory('1', categoryData)

      expect(query.update).toHaveBeenCalledWith(categoryData)
      expect(query.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedCategory)
    })

    it('throws an error when updating category details fails', async () => {
      const error = new Error('Unable to update category')

      query.single.mockResolvedValue({
        data: null,
        error,
      })

      await expect(
        updateCategory('1', { name: 'Updated Electronics' })
      ).rejects.toThrow('Unable to update category')
    })
  })

  describe('updateCategoryStatus', () => {
    it('activates or deactivates a category', async () => {
      const updatedCategory = {
        id: '1',
        is_active: false,
      }

      query.single.mockResolvedValue({
        data: updatedCategory,
        error: null,
      })

      const result = await updateCategoryStatus('1', false)

      expect(query.update).toHaveBeenCalledWith({
        is_active: false,
      })
      expect(query.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedCategory)
    })

    it('throws an error when updating category status fails', async () => {
      const error = new Error('Unable to update category status')

      query.single.mockResolvedValue({
        data: null,
        error,
      })

      await expect(
        updateCategoryStatus('1', false)
      ).rejects.toThrow('Unable to update category status')
    })
  })
})
