
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(amount)
}

const CartSummary = ({ subtotal }) => {
  // Delivery fee is currently fixed; we can make it dynamic later.
  const deliveryFee = subtotal > 0 ? 200 : 0
  const total = subtotal + deliveryFee

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Delivery Fee</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(deliveryFee)}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">
              Total
            </span>

            <span className="text-xl font-bold text-green-700">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/checkout"
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition ${
          subtotal > 0
            ? 'bg-green-600 hover:bg-green-700'
            : 'pointer-events-none bg-gray-300'
        }`}
        aria-disabled={subtotal <= 0}
        tabIndex={subtotal <= 0 ? -1 : 0}
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </Link>

      <Link
        to="/products"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
      >
        <ShoppingBag size={18} />
        Continue Shopping
      </Link>

      <p className="mt-4 text-center text-xs text-gray-400">
        Secure checkout. Your order will be confirmed after payment.
      </p>
    </div>
  )
}

export default CartSummary
