
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { getMyOrders } from '../services/orderService'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getMyOrders()
        setOrders(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load your orders.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading your orders...
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mb-8 text-gray-600">
          View your purchase history.
        </p>

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!error && orders.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-green-600" />

            <h2 className="mb-2 text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mb-6 text-gray-600">
              Your purchases will appear here.
            </p>

            <Link
              to="/products"
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Start Shopping
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.id}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-700">
                    KSh {Number(order.total_amount).toLocaleString()}
                  </p>

                  <span className="text-sm capitalize text-gray-600">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MyOrders
