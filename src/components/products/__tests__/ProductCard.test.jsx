
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../ProductCard'

const mockProduct = {
  id: 'product-1',
  name: 'Wireless Headphones',
  slug: 'wireless-headphones',
  price: 1500,
  compare_at_price: 2000,
  stock_quantity: 10,
  image_urls: ['https://example.com/headphones.jpg'],
  is_featured: true,
}

const renderProductCard = (product = mockProduct) => {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  )
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    renderProductCard()

    expect(
      screen.getByRole('heading', { name: 'Wireless Headphones' })
    ).toBeInTheDocument()
  })

  it('displays the product image', () => {
    renderProductCard()

    const image = screen.getByRole('img', {
      name: 'Wireless Headphones',
    })

    expect(image).toHaveAttribute(
      'src',
      'https://example.com/headphones.jpg'
    )
  })

  it('displays the product price', () => {
    renderProductCard()

    expect(screen.getByText(/1,500/)).toBeInTheDocument()
  })

  it('displays the previous price when it is higher than the current price', () => {
    renderProductCard()

    expect(screen.getByText(/2,000/)).toBeInTheDocument()
  })

  it('displays the featured badge for featured products', () => {
    renderProductCard()

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('displays an out-of-stock message and disables the button', () => {
    renderProductCard({
      ...mockProduct,
      stock_quantity: 0,
    })

    expect(screen.getByText('Out of stock')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /unavailable/i })
    ).toBeDisabled()
  })

  it('shows a placeholder when the product has no image', () => {
    renderProductCard({
      ...mockProduct,
      image_urls: [],
      is_featured: false,
      compare_at_price: null,
    })

    expect(
      screen.queryByRole('img', { name: 'Wireless Headphones' })
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Wireless Headphones' })
    ).toBeInTheDocument()

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })
})
