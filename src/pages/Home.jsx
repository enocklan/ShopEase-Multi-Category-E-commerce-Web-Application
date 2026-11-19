
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CategoryCard from '../components/products/CategoryCard'
import ProductCard from '../components/products/ProductCard'

import { getCategories } from '../services/categoryService'
import { getFeaturedProducts } from '../services/productService'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError('')

        const [categoryData, productData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(8),
        ])

        setCategories(categoryData || [])
        setProducts(productData || [])
      } catch (err) {
        console.error('Home page loading error:', err)
        setError('We could not load our products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-linear-to-r from-green-100 via-green-50 to-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-block rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-800">
                Welcome to ShopEase
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Everything You Need,
                <span className="block text-green-700">
                  All in One Place.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
                Discover quality products, explore amazing collections,
                and enjoy a simple and convenient shopping experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/categories"
                  className="rounded-lg border border-green-700 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-50"
                >
                  Explore Categories
                </Link>
              </div>
            </div>

            <div className="flex min-h-72 items-center justify-center rounded-3xl bg-green-200 p-10">
              <div className="text-center">
                <ShoppingBag
                  size={100}
                  strokeWidth={1.2}
                  className="mx-auto text-green-700"
                />
                <p className="mt-5 text-xl font-semibold text-green-900">
                  Your Shopping Journey Starts Here
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-green-700">
                Browse collections
              </p>
              <h2 className="mt-1 text-3xl font-bold text-gray-900">
                Shop by Category
              </h2>
            </div>

            <Link
              to="/categories"
              className="hidden items-center gap-2 font-semibold text-green-700 hover:text-green-800 sm:flex"
            >
              View all <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading categories...
            </p>
          ) : categories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white p-8 text-center text-gray-500">
              No categories available yet.
            </p>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-green-700">
                  Handpicked for you
                </p>
                <h2 className="mt-1 text-3xl font-bold text-gray-900">
                  Featured Products
                </h2>
              </div>

              <Link
                to="/products"
                className="hidden items-center gap-2 font-semibold text-green-700 hover:text-green-800 sm:flex"
              >
                View all <ArrowRight size={18} />
              </Link>
            </div>

            {loading ? (
              <p className="py-10 text-center text-gray-500">
                Loading products...
              </p>
            ) : products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                No featured products available yet.
              </p>
            )}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-7xl px-4 py-6 text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center gap-2 font-semibold text-green-700"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Call to Action */}
        <section className="bg-green-700 px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">
            Ready to Find Something You Love?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Explore our collections and discover products that make
            your everyday life easier.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-green-800 transition hover:bg-green-50"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
