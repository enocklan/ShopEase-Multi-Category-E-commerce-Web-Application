
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

      <div className="p-4">
        <Link to={`/products/${slug}`}>
          <h3 className="truncate text-lg font-semibold text-gray-900 hover:text-green-700">
            {name}
          </h3>
        </Link>

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

        <button
          type="button"
          disabled={isOutOfStock}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingBag size={18} />
          {isOutOfStock ? 'Unavailable' : 'View product'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
