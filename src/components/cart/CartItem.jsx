
import { Plus, Minus, Trash2, ImageOff } from 'lucide-react'

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(amount)
}

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const imageUrl = item.image_urls?.[0]
  const stock = Number(item.stock_quantity) || 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">

      {/* Product Image */}
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-green-50 sm:h-24 sm:w-24">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-green-600">
            <ImageOff size={30} />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">
          {item.name}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {formatPrice(Number(item.price))}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {stock} available
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between gap-4 sm:justify-center">
        <div className="flex items-center rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(item.id, item.quantity - 1)
            }
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="p-2 text-gray-600 transition hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="min-w-9 text-center text-sm font-semibold">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(item.id, item.quantity + 1)
            }
            disabled={item.quantity >= stock}
            aria-label="Increase quantity"
            className="p-2 text-gray-600 transition hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from cart`}
          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={19} />
        </button>
      </div>

      {/* Item Subtotal */}
      <div className="text-right sm:min-w-28">
        <p className="text-xs text-gray-400 sm:hidden">
          Subtotal
        </p>

        <p className="font-bold text-gray-900">
          {formatPrice(Number(item.price) * item.quantity)}
        </p>
      </div>
    </div>
  )
}

export default CartItem
