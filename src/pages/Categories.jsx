
import { useEffect, useState } from 'react'
import { RefreshCw, Layers } from 'lucide-react'

import CategoryCard from '../components/products/CategoryCard'
import { getCategories } from '../services/categoryService'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getCategories()
        setCategories(data || [])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('We could not load categories. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
    

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="font-semibold text-green-700">Browse collections</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Shop by Category
          </h1>

          <p className="mt-2 text-gray-500">
            Explore our collections and find products you love.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-green-600" size={35} />
          </div>
        )}

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

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <Layers className="mx-auto text-green-600" size={45} />

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No categories available
            </h2>

            <p className="mt-2 text-gray-500">
              Please check back later for new collections.
            </p>
          </div>
        )}
      </main>

    
    </div>
  )
}

export default Categories
