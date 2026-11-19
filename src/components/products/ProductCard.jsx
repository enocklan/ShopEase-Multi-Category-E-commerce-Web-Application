
import { Link } from 'react-router-dom'
import { ShoppingBag, ImageOff } from 'lucide-react'

const ProductCard = ({ product }) => {
  const {
    name,
    slug,
    price,
    compare_at_price,
    stock_quantity,
    image_urls,
    is_featured,
  } = product

  const imageUrl = image_urls?.[0]
  const isOutOfStock = stock_quantity <= 0

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <Link to={`/products/${slug}`} className="relative block">
        <div className="relative h-56 overflow-hidden bg-green-50">
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

          {is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
              Featured
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4">

        {/* Product Name */}
        <Link to={`/products/${slug}`}>
          <h3 className="truncate text-lg font-semibold text-gray-900 hover:text-green-700">
            {name}
          </h3>
        </Link>

        {/* Product Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-green-700">
            {formatPrice(price)}
          </span>

          {compare_at_price > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(compare_at_price)}
            </span>
          )}
        </div>

        {/* View Product Button */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2.5 font-medium text-white"
          >
            <ShoppingBag size={18} />
            Unavailable
          </button>
        ) : (
          <Link
            to={`/products/${slug}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700"
          >
            <ShoppingBag size={18} />
            View product
          </Link>
        )}
      </div>
    </div>
  )
}

export default ProductCard
