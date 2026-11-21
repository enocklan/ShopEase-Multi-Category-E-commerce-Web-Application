
import { useEffect, useState } from 'react'
import {
  RefreshCw,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
} from 'lucide-react'

import { supabase } from '../../supabase/client'
import { reconcilePayment } from '../../services/paymentService'

const ManagePayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reconcilingId, setReconcilingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchPayments = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    else setRefreshing(true)

    setError('')

    try {
      const { data, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          order_id,
          user_id,
          amount,
          currency,
          payment_method,
          status,
          transaction_reference,
          mpesa_receipt_number,
          phone_number,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (paymentError) throw paymentError

      const orderIds = [
        ...new Set((data || []).map((payment) => payment.order_id)),
      ]

      let orderMap = {}

      if (orderIds.length > 0) {
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select('id, order_number')
          .in('id', orderIds)

        if (orderError) throw orderError

        orderMap = Object.fromEntries(
          (orders || []).map((order) => [
            order.id,
            order.order_number,
          ])
        )
      }

      const formattedPayments = (data || []).map((payment) => ({
        ...payment,
        order_number: orderMap[payment.order_id] || 'Unavailable',
      }))

      setPayments(formattedPayments)
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err.message || 'Unable to load payments.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleReconcile = async (paymentId) => {
    setReconcilingId(paymentId)
    setMessage('')
    setError('')

    try {
      const result = await reconcilePayment(paymentId)

      if (result.pending) {
        setMessage(
          result.message ||
          'Safaricom has not confirmed this payment yet. It remains pending.'
        )
      } else {
        setMessage(
          result.message || 'Payment reconciliation completed.'
        )
      }

      await fetchPayments(false)
    } catch (err) {
      console.error('Payment reconciliation error:', err)
      setError(err.message || 'Unable to reconcile payment.')
    } finally {
      setReconcilingId(null)
    }
  }

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || 'KES',
    }).format(Number(amount || 0))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const completedCount = payments.filter(
    (payment) => payment.status === 'completed'
  ).length

  const pendingCount = payments.filter(
    (payment) => payment.status === 'pending'
  ).length

  const failedCount = payments.filter(
    (payment) => payment.status === 'failed'
  ).length

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <RefreshCw className="mr-2 animate-spin text-green-600" />
        <p className="text-gray-600">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Payments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor customer payments and verify M-Pesa transactions.
            </p>
          </div>

          <button
            onClick={() => fetchPayments(false)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-100 p-4 text-sm text-green-800">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <h2 className="mt-2 text-3xl font-bold text-green-700">
                  {completedCount}
                </h2>
              </div>
              <CheckCircle className="text-green-600" size={30} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </h2>
              </div>
              <Clock className="text-yellow-600" size={30} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {failedCount}
                </h2>
              </div>
              <AlertCircle className="text-red-600" size={30} />
            </div>
          </div>

        </div>

        {/* Payments table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="text-green-600" size={21} />
              <h2 className="font-semibold text-gray-900">
                All Transactions
              </h2>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-10 text-center">
              <CreditCard
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-medium text-gray-700">
                No payments found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Customer transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
             <table className="w-full text-left text-sm" style={{ minWidth: '950px' }}
>
                <thead className="bg-green-50 text-gray-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Payment method</th>
                    <th className="px-5 py-4 font-semibold">Phone</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Receipt</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-green-50/40"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {payment.order_number}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          {payment.payment_method === 'mpesa' ? (
                            <Smartphone
                              size={17}
                              className="text-green-600"
                            />
                          ) : (
                            <CreditCard size={17} />
                          )}
                          {payment.payment_method?.toUpperCase() || 'N/A'}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {payment.phone_number || '—'}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {payment.mpesa_receipt_number ||
                          payment.transaction_reference ||
                          '—'}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(payment.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {payment.status === 'pending' &&
                          payment.payment_method === 'mpesa' && (
                            <button
                              onClick={() => handleReconcile(payment.id)}
                              disabled={reconcilingId === payment.id}
                              className="whitespace-nowrap rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {reconcilingId === payment.id
                                ? 'Verifying...'
                                : 'Reconcile'}
                            </button>
                          )}

                        {payment.status === 'completed' && (
                          <span className="text-xs font-medium text-green-700">
                            Verified
                          </span>
                        )}

                        {payment.status === 'failed' && (
                          <span className="text-xs text-red-600">
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Payment reconciliation only marks a transaction completed
          after Safaricom confirms successful payment.
        </p>

      </div>
    </div>
  )
}

export default ManagePayments
