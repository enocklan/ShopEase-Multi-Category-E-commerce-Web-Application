
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../Footer'

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  it('displays the ShopEase brand', () => {
    renderFooter()

    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Ease')).toBeInTheDocument()
  })

  it('displays the shopping description', () => {
    renderFooter()

    expect(
      screen.getByText(/Your everyday shopping destination/)
    ).toBeInTheDocument()
  })

  it('displays the Quick Links section', () => {
    renderFooter()

    expect(screen.getByRole('heading', { name: 'Quick Links' }))
      .toBeInTheDocument()
  })

  it('displays all quick navigation links', () => {
    renderFooter()

    const quickLinks = screen.getByRole('heading', {
      name: 'Quick Links',
    }).parentElement

    expect(within(quickLinks).getByRole('link', { name: 'Home' }))
      .toHaveAttribute('href', '/')

    expect(within(quickLinks).getByRole('link', { name: 'Products' }))
      .toHaveAttribute('href', '/products')

    expect(within(quickLinks).getByRole('link', { name: 'Categories' }))
      .toHaveAttribute('href', '/categories')

    expect(within(quickLinks).getByRole('link', { name: 'Shopping Cart' }))
      .toHaveAttribute('href', '/cart')
  })

  it('displays the My Account section', () => {
    renderFooter()

    expect(screen.getByRole('heading', { name: 'My Account' }))
      .toBeInTheDocument()
  })

  it('displays all customer account links', () => {
    renderFooter()

    const accountSection = screen.getByRole('heading', {
      name: 'My Account',
    }).parentElement

    expect(within(accountSection).getByRole('link', { name: 'Login' }))
      .toHaveAttribute('href', '/login')

    expect(within(accountSection).getByRole('link', { name: 'Create Account' }))
      .toHaveAttribute('href', '/register')

    expect(within(accountSection).getByRole('link', { name: 'My Profile' }))
      .toHaveAttribute('href', '/profile')

    expect(within(accountSection).getByRole('link', { name: 'My Orders' }))
      .toHaveAttribute('href', '/my-orders')
  })

  it('displays the contact information', () => {
    renderFooter()

    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument()
    expect(screen.getByText('0726779485')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'enockkipkirui003@gmail.com' })
    ).toHaveAttribute('href', 'mailto:enockkipkirui003@gmail.com')
  })

  it('displays the Contact Us heading', () => {
    renderFooter()

    expect(screen.getByRole('heading', { name: 'Contact Us' }))
      .toBeInTheDocument()
  })

  it('displays the Facebook social link', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: 'Facebook' }))
      .toHaveAttribute('href', 'https://facebook.com')
  })

  it('displays the Instagram social link', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: 'Instagram' }))
      .toHaveAttribute('href', 'https://instagram.com')
  })

  it('displays the X social link', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: 'X' }))
      .toHaveAttribute('href', 'https://x.com')
  })

  it('displays the current year in the copyright notice', () => {
    renderFooter()

    const currentYear = new Date().getFullYear()

    expect(
      screen.getByText(`© ${currentYear} ShopEase. All rights reserved.`)
    ).toBeInTheDocument()
  })

  it('displays the developer credit', () => {
    renderFooter()

    expect(screen.getByText(/Made by/)).toBeInTheDocument()
    expect(screen.getByText('Enock♥')).toBeInTheDocument()
    expect(screen.getByText(/Kenya/)).toBeInTheDocument()
  })
})
