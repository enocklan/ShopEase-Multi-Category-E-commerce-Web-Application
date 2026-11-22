
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartItem from '../CartItem'

const mockItem = {
  id: 'product-1',
  name: 'Wireless Headphones',
  price: 2500,
  quantity: 2,
  stock_quantity: 5,
  image_urls: ['https://example.com/headphones.jpg'],
}

describe('CartItem', () => {
  it('renders the product name', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
  })

  it('displays the product image', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    const image = screen.getByRole('img', {
      name: 'Wireless Headphones',
    })

    expect(image).toHaveAttribute(
      'src',
      'https://example.com/headphones.jpg'
    )
  })

  it('displays the available stock', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(screen.getByText('5 available')).toBeInTheDocument()
  })

  it('calls onUpdateQuantity with increased quantity', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', {
      name: 'Increase quantity',
    }))

    expect(onUpdateQuantity).toHaveBeenCalledWith('product-1', 3)
  })

  it('calls onUpdateQuantity with decreased quantity', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', {
      name: 'Decrease quantity',
    }))

    expect(onUpdateQuantity).toHaveBeenCalledWith('product-1', 1)
  })

  it('disables decreasing when quantity is 1', () => {
    render(
      <CartItem
        item={{ ...mockItem, quantity: 1 }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(screen.getByRole('button', {
      name: 'Decrease quantity',
    })).toBeDisabled()
  })

  it('disables increasing when quantity reaches stock', () => {
    render(
      <CartItem
        item={{ ...mockItem, quantity: 5 }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(screen.getByRole('button', {
      name: 'Increase quantity',
    })).toBeDisabled()
  })

  it('calls onRemove with the product ID', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={onRemove}
      />
    )

    await user.click(screen.getByRole('button', {
      name: 'Remove Wireless Headphones from cart',
    }))

    expect(onRemove).toHaveBeenCalledWith('product-1')
  })

  it('displays the correct subtotal', () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

   expect(screen.getByText('Ksh 5,000.00')).toBeInTheDocument()
  })

  it('displays an image placeholder when no image exists', () => {
    render(
      <CartItem
        item={{ ...mockItem, image_urls: [] }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
