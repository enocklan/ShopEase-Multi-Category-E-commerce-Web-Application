
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const cartMocks = vi.hoisted(() => ({
  cartItems: [],
  cartTotal: 0,
  updateQuantity: vi.fn(),
  removeFromCart: vi.fn(),
}))

vi.mock('../../context/CartContext', () => ({
  useCart: () => cartMocks,
}))

vi.mock('../../components/cart/CartItem', () => ({
  default: ({ item, onUpdateQuantity, onRemove }) => (
    <div data-testid="cart-item">
      <span>{item.name}</span>
      <span>{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
        Increase
      </button>
      <button onClick={() => onRemove(item.id)}>
        Remove
      </button>
    </div>
  ),
}))

vi.mock('../../components/cart/CartSummary', () => ({
  default: ({ subtotal }) => (
    <div data-testid="cart-summary">
      Order Summary: {subtotal}
    </div>
  ),
}))

import Cart from '../Cart'

const renderCart = () =>
  render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  )

describe('Cart Page', () => {
  beforeEach(() => {
    cartMocks.cartItems = []
    cartMocks.cartTotal = 0
    cartMocks.updateQuantity.mockClear()
    cartMocks.removeFromCart.mockClear()
  })

  it('renders the shopping cart heading', () => {
    renderCart()

    expect(
      screen.getByRole('heading', { name: 'Shopping Cart' })
    ).toBeInTheDocument()
  })

  it('displays the empty cart message when there are no products', () => {
    renderCart()

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(
      screen.getByText(/You haven't added any products yet/i)
    ).toBeInTheDocument()
  })

  it('displays a Browse Products link when the cart is empty', () => {
    renderCart()

    expect(
      screen.getByRole('link', { name: /Browse Products/i })
    ).toHaveAttribute('href', '/products')
  })

  it('displays the Continue Shopping link', () => {
    renderCart()

    expect(
      screen.getByRole('link', { name: /Continue Shopping/i })
    ).toHaveAttribute('href', '/products')
  })

  it('displays cart products when the cart contains items', () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 2 },
      { id: '2', name: 'Phone', quantity: 1 },
    ]

    renderCart()

    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('displays the correct number of different cart items', () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 2 },
      { id: '2', name: 'Phone', quantity: 1 },
    ]

    renderCart()

    expect(screen.getByText('Cart Items (2)')).toBeInTheDocument()
  })

  it('displays the total quantity of products', () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 2 },
      { id: '2', name: 'Phone', quantity: 3 },
    ]

    renderCart()

    expect(screen.getByText('5 items')).toBeInTheDocument()
  })

  it('renders the order summary with the cart total', () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 1 },
    ]
    cartMocks.cartTotal = 50000

    renderCart()

    expect(screen.getByTestId('cart-summary')).toHaveTextContent(
      'Order Summary: 50000'
    )
  })

  it('passes the quantity update callback to cart items', async () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 1 },
    ]

    const { getByRole } = renderCart()

    await getByRole('button', { name: 'Increase' }).click()

    expect(cartMocks.updateQuantity).toHaveBeenCalledWith('1', 2)
  })

  it('passes the remove callback to cart items', async () => {
    cartMocks.cartItems = [
      { id: '1', name: 'Laptop', quantity: 1 },
    ]

    const { getByRole } = renderCart()

    await getByRole('button', { name: 'Remove' }).click()

    expect(cartMocks.removeFromCart).toHaveBeenCalledWith('1')
  })
})
