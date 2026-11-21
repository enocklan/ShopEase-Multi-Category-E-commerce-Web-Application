
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import {
  createProduct,
  uploadProductImage,
} from '../../services/productService'
import { ArrowLeft, Upload, Save } from 'lucide-react'

const AddProduct = () => {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    sku: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '',
  })

  // Load active categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError(err.message || 'Unable to load categories.')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    setImage(file || null)
    setPreview(file ? URL.createObjectURL(file) : '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Product name is required.')
      return
    }

    if (!formData.category_id) {
      setError('Please select a category.')
      return
    }

    if (!formData.sku.trim()) {
      setError('SKU is required.')
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError('Enter a valid product price.')
      return
    }

    if (
      formData.compare_at_price &&
      Number(formData.compare_at_price) < Number(formData.price)
    ) {
      setError('Compare-at price must be greater than or equal to the selling price.')
      return
    }

    if (
      formData.stock_quantity === '' ||
      !Number.isInteger(Number(formData.stock_quantity)) ||
      Number(formData.stock_quantity) < 0
    ) {
      setError('Enter a valid stock quantity.')
      return
    }

    if (!image) {
      setError('Please select a product image.')
      return
    }

    setLoading(true)

    try {
      const imageUrl = await uploadProductImage(image)

      const slug = formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      await createProduct({
        name: formData.name.trim(),
        slug: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
        description: formData.description.trim(),
        category_id: formData.category_id,
        sku: formData.sku.trim(),
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price
          ? Number(formData.compare_at_price)
          : null,
        stock_quantity: Number(formData.stock_quantity),
        image_urls: [imageUrl],
        is_active: true,
        is_featured: false,
      })

      setSuccess('Product added successfully!')

      setTimeout(() => navigate('/admin/products'), 1200)
    } catch (err) {
      setError(err.message || 'Failed to add product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-green-700 hover:text-green-900"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Add New Product
        </h1>
        <p className="mt-2 text-gray-600">
          Enter the product details below.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-green-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Product Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
            placeholder="e.g. Samsung Galaxy A15"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
            placeholder="Describe the product..."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Category *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories}
              className="w-full rounded-lg border border-gray-300 p-3"
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select category'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              SKU *
            </label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="e.g. SAM-A15-001"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Selling Price (KES) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Compare-at Price (KES)
            </label>
            <input
              type="number"
              name="compare_at_price"
              value={formData.compare_at_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Product Image *
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-300 p-6 hover:bg-green-50">
            <Upload size={30} className="mb-2 text-green-700" />
            <span className="font-medium text-gray-700">
              Click to select an image
            </span>
            <span className="mt-1 text-sm text-gray-500">
              JPG, PNG or WebP — maximum 5MB
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Product preview"
              className="mt-4 h-48 w-48 rounded-lg object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading || loadingCategories || categories.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving Product...' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}

export default AddProduct
