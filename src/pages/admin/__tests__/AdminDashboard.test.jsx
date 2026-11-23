
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}))

vi.mock('../../../supabase/client', () => ({
  supabase: {
    from: supabaseMocks.from,
  },
}))

import AdminDashboard from '../AdminDashboard'

const mockDashboardData = ({
  productCount = 10,
  customerCount = 5,
  orderCount = 8,
  payments = [],
  recentOrders = [],
} = {}) => {
  const results = {
    products: { count: productCount, error: null },
    profiles: { count: customerCount, error: null },
    orders: { count: orderCount, error: null },
    payments: { data: payments, error: null },
    recentOrders: { data: recentOrders, error: null },
  }

  supabaseMocks.from.mockImplementation((table) => {
    let result

    if (table === 'products') result = results.products
    if (table === 'profiles') result = results.profiles
    if (table === 'payments') result = results.payments
    if (table === 'orders') {
      result = results.orders
    }

    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(() => query),
      limit: vi.fn(() => query),
      then: (resolve, reject) => {
        const finalResult =
          table === 'orders' && query.limit.mock.calls.length
            ? results.recentOrders
            : result

        return Promise.resolve(finalResult).then(resolve, reject)
      },
    }

    return query
  })
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockDashboardData()
  })

  it('renders the dashboard heading', async () => {
    render(<AdminDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Admin Dashboard' })
    ).toBeInTheDocument()
  })
it('displays loading states initially', () => {
  supabaseMocks.from.mockImplementation(() => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(() => query),
      limit: vi.fn(() => query),
      then: () => new Promise(() => {}),
    }

    return query
  })

  render(<AdminDashboard />)

  expect(screen.getAllByText('...')).toHaveLength(3)

  expect(screen.getByText('Loading revenue...')).toBeInTheDocument()

  expect(
    screen.getByText('Loading recent orders...')
  ).toBeInTheDocument()
})

  it('displays product, customer and order statistics', async () => {
    mockDashboardData({
      productCount: 25,
      customerCount: 12,
      orderCount: 40,
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('40')).toBeInTheDocument()
    })
  })

  it('calculates completed payment revenue by currency', async () => {
    mockDashboardData({
      payments: [
        { amount: 1000, currency: 'KES' },
        { amount: 2000, currency: 'KES' },
        { amount: 50, currency: 'USD' },
      ],
    })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(
        screen.getByText('Completed Payment Revenue')
      ).toBeInTheDocument()

      expect(screen.getByText(/Ksh\s?3,000\.00/i)).toBeInTheDocument()
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument()
    })
  })

  it('displays a message when there are no completed payments', async () => {
    render(<AdminDashboard />)

    expect(
      await screen.findByText('No completed payments')
    ).toBeInTheDocument()
  })

  it('displays recent orders', async () => {
    mockDashboardData({
      recentOrders: [
        {
          id: 'order-1',
          order_number: 'SE-001',
          total_amount: 5000,
          currency: 'KES',
          status: 'processing',
          created_at: '2026-11-20T10:00:00Z',
        },
      ],
    })

    render(<AdminDashboard />)

    expect(await screen.findByText('SE-001')).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
  })

  it('displays a message when there are no recent orders', async () => {
    render(<AdminDashboard />)

    expect(await screen.findByText('No orders found.')).toBeInTheDocument()
  })

  it('displays an error when a database query fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    supabaseMocks.from.mockImplementation((table) => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        is: vi.fn(() => query),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        then: (resolve) =>
          Promise.resolve(
            table === 'products'
              ? {
                  count: null,
                  error: new Error('Database connection failed'),
                }
              : { count: 0, data: [], error: null }
          ).then(resolve),
      }

      return query
    })

    render(<AdminDashboard />)

    expect(
      await screen.findByText('Dashboard loading failed')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Database connection failed')
    ).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('refreshes dashboard data when the Refresh button is clicked', async () => {
    render(<AdminDashboard />)

    await screen.findByText('No orders found.')

    const initialCalls = supabaseMocks.from.mock.calls.length

    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }))

    await waitFor(() => {
      expect(supabaseMocks.from.mock.calls.length).toBeGreaterThan(
        initialCalls
      )
    })
  })
})
