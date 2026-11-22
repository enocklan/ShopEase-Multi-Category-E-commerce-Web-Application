
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CategoryCard from '../CategoryCard'

const mockCategory = {
  id: 'category-1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Phones, laptops and electronic accessories.',
  image_url: 'https://example.com/electronics.jpg',
}

const renderCategoryCard = (category = mockCategory) => {
  return render(
    <MemoryRouter>
      <CategoryCard category={category} />
    </MemoryRouter>
  )
}

describe('CategoryCard', () => {
  it('renders the category name', () => {
    renderCategoryCard()

    expect(
      screen.getByRole('heading', { name: 'Electronics' })
    ).toBeInTheDocument()
  })

  it('displays the category description', () => {
    renderCategoryCard()

    expect(
      screen.getByText('Phones, laptops and electronic accessories.')
    ).toBeInTheDocument()
  })

  it('displays the category image', () => {
    renderCategoryCard()

    const image = screen.getByRole('img', {
      name: 'Electronics',
    })

    expect(image).toHaveAttribute(
      'src',
      'https://example.com/electronics.jpg'
    )
  })

  it('displays a fallback description when none is provided', () => {
    renderCategoryCard({
      ...mockCategory,
      description: '',
    })

    expect(
      screen.getByText('Explore our products in this category.')
    ).toBeInTheDocument()
  })

  it('displays an image placeholder when no image is provided', () => {
    renderCategoryCard({
      ...mockCategory,
      image_url: null,
    })

    expect(
      screen.queryByRole('img', { name: 'Electronics' })
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Electronics' })
    ).toBeInTheDocument()
  })

  it('links to the correct category page', () => {
    renderCategoryCard()

    expect(
      screen.getByRole('link')
    ).toHaveAttribute('href', '/categories/electronics')
  })
})
