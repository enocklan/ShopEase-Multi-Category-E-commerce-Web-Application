
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ShoppingBag, RefreshCw } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/products/ProductCard'
import { getProducts } from '../services/productService'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const searchTerm = searchParams.get('search') || ''

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getProducts({
          search: searchTerm,
          sortBy: 'created_at',
          ascending: false,
        })

        setProducts(data || [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('We could not load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm])

  const handleSearch = (event) => {
    const value = event.target.value

    if (value.trim()) {
      setSearchParams({ search: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="font-semibold text-green-700">Our Collection</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            All Products
          </h1>

          <p className="mt-2 text-gray-500">
            Discover quality products at affordable prices.
          </p>
        </div>

        {/* Product Search */}
        <div className="mb-8">
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 sm:max-w-md"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-green-600" size={35} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="mt-3 block w-full font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && products.length > 0 && (
          <>
            <p className="mb-5 text-sm text-gray-500">
              Showing {products.length} products
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-green-600" size={45} />

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              Try another search or explore our full collection.
            </p>

            <Link
              to="/products"
              onClick={() => setSearchParams({})}
              className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              View All Products
            </Link>
          </div>
        )}
      </main>

      
    </div>
  )
}

export default Products
