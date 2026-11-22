
import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'

import { getAdminCustomers } from '../../services/authService'
import { getAdminOrders } from '../../services/orderService'

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [showDetails, setShowDetails] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError('')

      const [customerData, orderData] = await Promise.all([
        getAdminCustomers(),
        getAdminOrders(),
      ])

      setCustomers(customerData)
      setOrders(orderData)
    } catch (err) {
      setError(err.message || 'Unable to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return customers

    return customers.filter((customer) =>
      [
        customer.full_name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [customers, search])

  const totalOrders = orders.length

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer)

    const customerOrderHistory = orders.filter(
      (order) => order.user_id === customer.id
    )

    setCustomerOrders(customerOrderHistory)
    setShowDetails(true)
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0))
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-green-600" />
        <p className="text-gray-600">Loading customers...</p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View registered customers and their purchase history.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {customers.length}
              </h2>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {totalOrders}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <ShoppingBag size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Customer table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">
            Registered Customers ({filteredCustomers.length})
          </h2>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />

            <p className="font-medium text-gray-700">
              No customers found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try another search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-green-50 text-sm text-gray-600">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-green-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || 'Customer'}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                            <User size={20} />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {customer.full_name || 'Unnamed customer'}
                          </p>

                          <p className="text-sm text-gray-500">
                            {customer.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.phone || 'Not provided'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        {customer.order_count}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openCustomerDetails(customer)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer details modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold text-gray-900">
                Customer Details
              </h2>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close customer details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="flex items-center gap-4">
                {selectedCustomer.avatar_url ? (
                  <img
                    src={selectedCustomer.avatar_url}
                    alt={selectedCustomer.full_name || 'Customer'}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <User size={30} />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedCustomer.full_name || 'Unnamed customer'}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Customer since {formatDate(selectedCustomer.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-500">
                    <Mail size={17} />
                    <span className="text-sm">Email</span>
                  </div>

                  <p className="break-all font-medium text-gray-900">
                    {selectedCustomer.email || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-500">
                    <Phone size={17} />
                    <span className="text-sm">Phone</span>
                  </div>

                  <p className="font-medium text-gray-900">
                    {selectedCustomer.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Order History ({customerOrders.length})
                </h3>

                {customerOrders.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-500">
                    This customer has not placed any orders yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-lg border border-gray-100 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Order #{order.order_number || order.id.slice(0, 8)}
                            </p>

                            <p className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-green-700">
                              {formatCurrency(order.total_amount, order.currency || 'KES')}
                            </p>

                            <span className="text-sm capitalize text-gray-500">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t p-5">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ManageCustomers
