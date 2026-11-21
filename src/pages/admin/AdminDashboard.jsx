
import { useEffect, useState } from 'react'
import {
  Package,
  Users,
  ShoppingCart,
  Wallet,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import { supabase } from '../../supabase/client'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    revenue: {},
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch total products
      const productsResult = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })

      // Fetch total customers
      const customersResult = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer')
        .is('deleted_at', null)

      // Fetch total orders
      const ordersResult = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })

      // Fetch completed payments
      const paymentsResult = await supabase
        .from('payments')
        .select('amount, currency')
        .eq('status', 'completed')

      // Fetch five recent orders
      const recentOrdersResult = await supabase
        .from('orders')
        .select(
          'id, order_number, total_amount, currency, status, created_at'
        )
        .order('created_at', { ascending: false })
        .limit(5)

      // Check for database errors
      const results = [
        productsResult,
        customersResult,
        ordersResult,
        paymentsResult,
        recentOrdersResult,
      ]

      const failedResult = results.find((result) => result.error)

      if (failedResult) {
        throw failedResult.error
      }

      // Calculate revenue separately for each currency
      const revenue = {}

      paymentsResult.data.forEach((payment) => {
        const currency = payment.currency || 'KES'

        revenue[currency] =
          (revenue[currency] || 0) + Number(payment.amount || 0)
      })

      setStats({
        products: productsResult.count || 0,
        customers: customersResult.count || 0,
        orders: ordersResult.count || 0,
        revenue,
      })

      setRecentOrders(recentOrdersResult.data || [])
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Unable to load dashboard information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount, currency) => {
    try {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency} ${Number(amount).toLocaleString()}`
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const cards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Customers',
      value: stats.customers,
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      icon: ShoppingCart,
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Dashboard heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Welcome to your ShopEase administration panel.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Dashboard loading failed</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-gray-900">
                    {loading ? '...' : card.value.toLocaleString()}
                  </h2>
                </div>

                <div className={`rounded-xl p-4 ${card.color}`}>
                  <Icon size={25} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue card */}
      <div className="rounded-xl border border-green-100 bg-green-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-700 p-3 text-white">
            <Wallet size={25} />
          </div>

          <div>
            <p className="text-sm font-medium text-green-800">
              Completed Payment Revenue
            </p>

            {loading ? (
              <p className="mt-2 text-lg font-semibold text-gray-500">
                Loading revenue...
              </p>
            ) : Object.keys(stats.revenue).length === 0 ? (
              <p className="mt-2 text-xl font-bold text-gray-900">
                No completed payments
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {Object.entries(stats.revenue).map(
                  ([currency, amount]) => (
                    <p
                      key={currency}
                      className="text-xl font-bold text-gray-900"
                    >
                      {formatCurrency(amount, currency)}
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The latest five customer orders.
          </p>
        </div>

        {loading ? (
          <p className="p-6 text-center text-gray-500">
            Loading recent orders...
          </p>
        ) : recentOrders.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No orders found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Order Number
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-green-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {order.order_number}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(
                        Number(order.total_amount),
                        order.currency || 'KES'
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
