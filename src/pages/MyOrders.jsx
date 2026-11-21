
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, XCircle, RefreshCw } from 'lucide-react'
import { getMyOrders, cancelMyOrder } from '../services/orderService'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const loadOrders = async () => {
    try {
      setError('')
      const data = await getMyOrders()
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load your orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.order_number || order.id}?`
    )

    if (!confirmed) return

    try {
      setCancellingId(order.id)
      setError('')
      setSuccess('')

      await cancelMyOrder(order.id)

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.id === order.id
            ? { ...item, status: 'cancelled' }
            : item
        )
      )

      setSuccess('Your order has been cancelled successfully.')
    } catch (err) {
      setError(err.message || 'Unable to cancel your order.')
    } finally {
      setCancellingId(null)
    }
  }

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
          View and manage your purchase history.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-lg bg-green-100 p-4 text-green-800">
            {success}
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
                    Order #{order.order_number || order.id}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-700">
                    KSh {Number(order.total_amount).toLocaleString()}
                  </p>

                  <span
                    className={`text-sm font-medium capitalize ${
                      order.status === 'cancelled'
                        ? 'text-red-600'
                        : order.status === 'delivered'
                          ? 'text-green-700'
                          : 'text-gray-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancellingId === order.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingId === order.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </>
                    )}
                  </button>

                  <p className="mt-2 text-xs text-gray-500">
                    You can cancel this order while it is still pending.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MyOrders
