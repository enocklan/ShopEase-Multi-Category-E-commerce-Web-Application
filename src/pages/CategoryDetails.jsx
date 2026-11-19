
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PackageOpen } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/products/ProductCard'

import { getCategoryBySlug } from '../services/categoryService'
import { getProductsByCategory } from '../services/productService'

const CategoryDetails = () => {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const categoryData = await getCategoryBySlug(slug)

        if (!categoryData) {
          setCategory(null)
          setProducts([])
          return
        }

        setCategory(categoryData)

        const productsData = await getProductsByCategory(categoryData.id)
        setProducts(productsData || [])
      } catch (err) {
        console.error('Error fetching category:', err)
        setError('Unable to load this category. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [slug])

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <Link
            to="/categories"
            className="mb-8 inline-flex items-center gap-2 text-green-700 hover:text-green-800"
          >
            <ArrowLeft size={18} />
            Back to categories
          </Link>

          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
              <p className="mt-4 text-gray-600">
                Loading category...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          ) : !category ? (
            <div className="py-20 text-center">
              <PackageOpen className="mx-auto text-gray-400" size={48} />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Category not found
              </h1>
              <Link
                to="/categories"
                className="mt-4 inline-block text-green-700 hover:underline"
              >
                Browse all categories
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="mt-3 max-w-2xl text-gray-600">
                    {category.description}
                  </p>
                )}

                <p className="mt-3 text-sm text-gray-500">
                  {products.length} {products.length === 1 ? 'product' : 'products'} available
                </p>
              </div>

              {products.length === 0 ? (
                <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
                  <PackageOpen className="mx-auto text-gray-400" size={48} />

                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    No products available
                  </h2>

                  <p className="mt-2 text-gray-600">
                    There are currently no products in this category.
                  </p>

                  <Link
                    to="/products"
                    className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                  >
                    Browse all products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default CategoryDetails
