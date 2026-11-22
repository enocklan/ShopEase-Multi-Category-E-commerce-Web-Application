
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartSummary from '../CartSummary'

const renderCartSummary = (subtotal) => {
  return render(
    <MemoryRouter>
      <CartSummary subtotal={subtotal} />
    </MemoryRouter>
  )
}

describe('CartSummary', () => {
  it('renders the order summary heading', () => {
    renderCartSummary(1000)

    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('displays the subtotal', () => {
    renderCartSummary(1000)

    expect(screen.getByText('Ksh 1,000.00')).toBeInTheDocument()
  })

  it('adds a KSh 200 delivery fee when subtotal is greater than zero', () => {
    renderCartSummary(1000)

    expect(screen.getByText('Ksh 200.00')).toBeInTheDocument()
  })

  it('calculates the correct total', () => {
    renderCartSummary(1000)

    expect(screen.getByText('Ksh 1,200.00')).toBeInTheDocument()
  })

  it('sets delivery fee to zero when subtotal is zero', () => {
  renderCartSummary(0)

  expect(screen.getAllByText('Ksh 0.00')).toHaveLength(3)
})
 it('displays the correct total when the cart is empty', () => {
  renderCartSummary(0)

  const amounts = screen.getAllByText('Ksh 0.00')

  expect(amounts[2]).toBeInTheDocument()
})

  it('links to checkout', () => {
    renderCartSummary(1000)

    expect(
      screen.getByRole('link', { name: /proceed to checkout/i })
    ).toHaveAttribute('href', '/checkout')
  })

  it('disables checkout when subtotal is zero', () => {
    renderCartSummary(0)

    const checkoutLink = screen.getByRole('link', {
      name: /proceed to checkout/i,
    })

    expect(checkoutLink).toHaveAttribute('aria-disabled', 'true')
    expect(checkoutLink).toHaveAttribute('tabindex', '-1')
  })

  it('enables checkout when subtotal is greater than zero', () => {
    renderCartSummary(1000)

    const checkoutLink = screen.getByRole('link', {
      name: /proceed to checkout/i,
    })

    expect(checkoutLink).toHaveAttribute('aria-disabled', 'false')
    expect(checkoutLink).toHaveAttribute('tabindex', '0')
  })

  it('links to the products page', () => {
    renderCartSummary(1000)

    expect(
      screen.getByRole('link', { name: /continue shopping/i })
    ).toHaveAttribute('href', '/products')
  })

  it('displays the secure checkout message', () => {
    renderCartSummary(1000)

    expect(
      screen.getByText(/secure checkout/i)
    ).toBeInTheDocument()
  })
})

