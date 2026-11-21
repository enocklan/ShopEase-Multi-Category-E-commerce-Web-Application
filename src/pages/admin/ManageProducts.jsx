
import { useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Package,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

import {
  getAdminProducts,
  updateProductStatus,
} from '../../services/productService'

const ManageProducts = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminProducts({
        search,
        status,
      })

      setProducts(data || [])
    } catch (err) {
      console.error('Products error:', err)
      setError(err.message || 'Unable to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, status])

  const handleStatusChange = async (product) => {
    const newStatus = !product.is_active

    try {
      setUpdatingId(product.id)
      setError('')
      setSuccess('')

      await updateProductStatus(product.id, newStatus)

      setSuccess(
        `${product.name} ${newStatus ? 'activated' : 'deactivated'} successfully.`
      )

      await fetchProducts()
    } catch (err) {
      console.error('Status update error:', err)
      setError(err.message || 'Unable to update product status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 2,
    }).format(Number(price || 0))
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Manage Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View, search and manage your store products.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {loading ? '...' : products.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Products</p>
          <h2 className="mt-2 text-2xl font-bold text-green-700">
            {loading
              ? '...'
              : products.filter((product) => product.is_active).length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Products</p>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {loading
              ? '...'
              : products.filter((product) => !product.is_active).length}
          </h2>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name, description or SKU..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-500"
        >
          <option value="all">All Products</option>
          <option value="active">Active Products</option>
          <option value="inactive">Inactive Products</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-bold text-gray-900">
            Product Inventory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {products.length} products found
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw
              size={30}
              className="animate-spin text-green-600"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-800">
              No products found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" style={{ minWidth: '850px' }}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-green-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_urls?.[0] ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-700">
                            <Package size={22} />
                          </div>
                        )}

                        <span className="font-semibold text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {product.sku || '—'}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {product.stock_quantity}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleStatusChange(product)}
                        disabled={updatingId === product.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                          product.is_active
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {product.is_active ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                        {updatingId === product.id
                          ? 'Updating...'
                          : product.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageProducts
