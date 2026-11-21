
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ShoppingBag,
  Clock,
  Truck,
  Package,
} from 'lucide-react'

import {
  getAdminOrders,
  updateOrderStatus,
} from '../../services/orderService'

const ManageOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminOrders()
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Order statistics
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(
      (order) => order.status === 'pending'
    ).length,
    processing: orders.filter(
      (order) => order.status === 'processing'
    ).length,
    shipped: orders.filter(
      (order) => order.status === 'shipped'
    ).length,
    delivered: orders.filter(
      (order) => order.status === 'delivered'
    ).length,
    cancelled: orders.filter(
      (order) => order.status === 'cancelled'
    ).length,
  }), [orders])

  // Search and filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.customer?.full_name || ''
      const orderNumber = order.order_number || ''

      const matchesSearch =
        orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        customerName.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  // Update order status securely through Supabase
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel this order? This action cannot be undone. Any completed payment will not automatically be refunded.'
      )

      if (!confirmed) return
    }

    try {
      setUpdatingId(orderId)
      setError('')
      setSuccess('')

      const updatedOrder = await updateOrderStatus(
        orderId,
        newStatus
      )

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      )

      setSelectedOrder((current) =>
        current?.id === orderId
          ? { ...current, ...updatedOrder }
          : current
      )

      setSuccess(
        `Order status successfully updated to ${newStatus}.`
      )
    } catch (err) {
      setError(err.message || 'Unable to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Currency formatting
  const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
    }).format(Number(amount || 0))
  }

  // Date formatting
  const formatDate = (date) => {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Status styling
  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }

    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  // Format shipping address
  const getShippingAddress = (address) => {
    if (!address) return 'No delivery address provided'

    if (typeof address === 'string') return address

    return [
      address.fullName,
      address.address,
      address.street,
      address.city,
      address.phone,
    ].filter(Boolean).join(', ') || 'Address details unavailable'
  }

  // Get valid next statuses for an order
  const getAvailableStatuses = (status) => {
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    }

    return transitions[status] || []
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-6">

      {/* Page heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Manage Orders
          </h1>

          <p className="mt-1 text-gray-600">
            View customer orders and manage their progress.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Statistics cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stats.total}
              </h2>
            </div>

            <ShoppingBag className="text-green-700" size={30} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                {stats.pending}
              </h2>
            </div>

            <Clock className="text-yellow-600" size={30} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Processing Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-blue-700">
                {stats.processing}
              </h2>
            </div>

            <Truck className="text-blue-700" size={30} />
          </div>
        </div>

      </div>

      {/* Additional status statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Shipped</p>
          <p className="mt-1 text-2xl font-bold text-purple-700">
            {stats.shipped}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {stats.delivered}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {stats.cancelled}
          </p>
        </div>

      </div>

      {/* Search and filters */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">

        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-green-600"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-900">
            Customer Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredOrders.length} order(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              className="mx-auto mb-3 text-gray-400"
              size={40}
            />

            <p className="font-medium text-gray-700">
              No orders found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">

              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-5 py-4">Order Number</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-green-50/50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {order.order_number}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {order.customer?.full_name || 'Unknown customer'}
                      </p>

                      <p className="text-xs text-gray-500">
                        {order.customer?.phone || 'No phone number'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {formatCurrency(
                        order.total_amount,
                        order.currency
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setError('')
                          setSuccess('')
                          setSelectedOrder(order)
                        }}
                        className="flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedOrder.order_number}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close order details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-5">

              {/* Customer information */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Customer Information
                </h3>

                <div className="rounded-lg bg-gray-50 p-4 text-sm">
                  <p>
                    <strong>Name:</strong>{' '}
                    {selectedOrder.customer?.full_name || 'Unknown customer'}
                  </p>

                  <p className="mt-2">
                    <strong>Phone:</strong>{' '}
                    {selectedOrder.customer?.phone || 'Not available'}
                  </p>

                  <p className="mt-2">
                    <strong>Delivery address:</strong>{' '}
                    {getShippingAddress(selectedOrder.shipping_address)}
                  </p>
                </div>
              </section>

              {/* Purchased products */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Purchased Products
                </h3>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[400px] text-sm">

                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Quantity</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium">
                            {item.product_name}
                          </td>

                          <td className="p-3 text-center">
                            {item.quantity}
                          </td>

                          <td className="p-3 text-right">
                            {formatCurrency(
                              item.subtotal,
                              selectedOrder.currency
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              </section>

              {/* Order totals */}
              <section className="space-y-2 rounded-lg bg-green-50 p-4 text-sm">

                <div className="flex justify-between">
                  <span>Subtotal</span>

                  <strong>
                    {formatCurrency(
                      selectedOrder.subtotal,
                      selectedOrder.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Delivery fee</span>

                  <strong>
                    {formatCurrency(
                      selectedOrder.delivery_fee,
                      selectedOrder.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between border-t border-green-200 pt-3 text-base">
                  <span className="font-bold">Total</span>

                  <strong className="text-green-800">
                    {formatCurrency(
                      selectedOrder.total_amount,
                      selectedOrder.currency
                    )}
                  </strong>
                </div>

              </section>

              {/* Update order status */}
              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Update Order Status
                </h3>

                {getAvailableStatuses(selectedOrder.status).length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    This order is {selectedOrder.status}. No further
                    status changes are allowed.
                  </div>
                ) : (
                  <>
                    <select
                      key={`${selectedOrder.id}-${selectedOrder.status}`}
                      defaultValue=""
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusUpdate(
                            selectedOrder.id,
                            e.target.value
                          )
                        }
                      }}
                      className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-green-600 disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Current: {selectedOrder.status} — Choose next status
                      </option>

                      {getAvailableStatuses(selectedOrder.status).map(
                        (status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        )
                      )}
                    </select>

                    {updatingId === selectedOrder.id && (
                      <p className="mt-2 text-sm text-green-700">
                        Updating order status...
                      </p>
                    )}
                  </>
                )}

                {selectedOrder.status === 'cancelled' && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    This order has been cancelled. Any completed payment
                    requires a separate refund process.
                  </p>
                )}

                {selectedOrder.status === 'delivered' && (
                  <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    This order has been successfully delivered.
                  </p>
                )}
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ManageOrders
