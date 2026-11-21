
import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Eye,
  EyeOff,
  X,
  Tags,
  Save,
} from 'lucide-react'

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
} from '../../services/categoryService'

import { uploadProductImage } from '../../services/productService'

const emptyForm = {
  name: '',
  description: '',
}

const ManageCategories = () => {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getAdminCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAddForm = () => {
    setEditingCategory(null)
    setFormData(emptyForm)
    setImage(null)
    setPreview('')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEditForm = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
    })
    setImage(null)
    setPreview(category.image_url || '')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG and WebP images are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must not exceed 5MB.')
      return
    }

    setError('')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Category name is required.')
      return
    }

    setSaving(true)

    try {
      let imageUrl = editingCategory?.image_url || null

      if (image) {
        imageUrl = await uploadProductImage(image, 'categories')
      }

      const slug = formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const categoryData = {
        name: formData.name.trim(),
        slug,
        description: formData.description.trim(),
        image_url: imageUrl,
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        setSuccess('Category updated successfully.')
      } else {
        await createCategory({
          ...categoryData,
          is_active: true,
        })
        setSuccess('Category created successfully.')
      }

      setShowForm(false)
      setFormData(emptyForm)
      setImage(null)
      setPreview('')
      await fetchCategories()
    } catch (err) {
      setError(err.message || 'Unable to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (category) => {
    setError('')
    setSuccess('')

    try {
      await updateCategoryStatus(category.id, !category.is_active)
      setSuccess(
        category.is_active
          ? 'Category deactivated successfully.'
          : 'Category activated successfully.'
      )
      await fetchCategories()
    } catch (err) {
      setError(err.message || 'Unable to update category status.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Categories
          </h1>
          <p className="mt-2 text-gray-600">
            Create and organize your shop categories.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          <Plus size={19} />
          Add Category
        </button>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {categories.length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Active Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {categories.filter((item) => item.is_active).length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Inactive Categories</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-600">
            {categories.filter((item) => !item.is_active).length}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none focus:border-green-600"
          />
        </div>

        <button
          onClick={fetchCategories}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          <Tags size={40} className="mx-auto mb-3 text-gray-400" />
          No categories found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left" style={{ minWidth: '750px' }}>
            <thead className="bg-green-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <Tags size={22} />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="max-w-xs p-4 text-sm text-gray-600">
                    {category.description || 'No description'}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(category)}
                        title="Edit category"
                        className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleStatusChange(category)}
                        title={category.is_active ? 'Deactivate' : 'Activate'}
                        className="rounded-lg p-2 text-green-700 hover:bg-green-50"
                      >
                        {category.is_active ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Electronics"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  placeholder="Describe this category..."
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border p-3"
                />

                {preview && (
                  <img
                    src={preview}
                    alt="Category preview"
                    className="mt-3 h-36 w-36 rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving
                    ? 'Saving...'
                    : editingCategory
                      ? 'Update Category'
                      : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCategories
