
import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff } from 'lucide-react'

const CategoryCard = ({ category }) => {
  const {
    name,
    slug,
    description,
    image_url: imageUrl,
  } = category

  return (
    <Link
      to={`/categories/${slug}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Category Image */}
      <div className="relative h-48 overflow-hidden bg-green-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-green-600">
            <ImageOff size={40} />
          </div>
        )}

       <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      </div>

      {/* Category Details */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 transition group-hover:text-green-700">
            {name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {description || 'Explore our products in this category.'}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-green-50 p-2 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
