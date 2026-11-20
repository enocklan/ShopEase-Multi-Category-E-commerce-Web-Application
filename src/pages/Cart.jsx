
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react'


import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
  

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Page Heading */}
        <div className="mb-8">
          <Link
            to="/products"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-500">
            Review your selected products before checkout.
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <ShoppingCart size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't added any products yet. Explore our store
              and find something you love.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <ShoppingBag size={19} />
              Browse Products
            </Link>
          </div>
        ) : (
          /* Cart with Products */
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>

                <span className="text-sm text-gray-500">
                  {cartItems.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )} items
                </span>
              </div>

              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-28">
              <CartSummary subtotal={cartTotal} />
            </div>
          </div>
        )}
      </main>

   
    </div>
  )
}

export default Cart
