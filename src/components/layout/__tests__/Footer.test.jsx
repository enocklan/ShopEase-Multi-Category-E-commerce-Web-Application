
import { render, screen } from '@testing-library/react'
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const authMocks = vi.hoisted(() => ({
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => authMocks,
}))

import Footer from '../Footer'

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  beforeEach(() => {
    authMocks.isAuthenticated = false
    authMocks.isAdmin = false
    authMocks.loading = false
  })

  it('displays the ShopEase brand', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /shop ease/i })
    ).toBeInTheDocument()
  })

  it('displays the shopping description', () => {
    renderFooter()

    expect(
      screen.getByText(/your everyday shopping destination/i)
    ).toBeInTheDocument()
  })

  it('displays the Quick Links section', () => {
    renderFooter()

    expect(
      screen.getByRole('heading', { name: /quick links/i })
    ).toBeInTheDocument()
  })

  it('displays all quick navigation links', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    )

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '/products'
    )

    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/categories'
    )

    expect(
      screen.getByRole('link', { name: /shopping cart/i })
    ).toHaveAttribute('href', '/cart')
  })

  it('displays the My Account section', () => {
    renderFooter()

    expect(
      screen.getByRole('heading', { name: /my account/i })
    ).toBeInTheDocument()
  })

  it('displays login and create account links for guests', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /login/i })
    ).toHaveAttribute('href', '/login')

    expect(
      screen.getByRole('link', { name: /create account/i })
    ).toHaveAttribute('href', '/register')
  })

  it('displays customer links when authenticated', () => {
    authMocks.isAuthenticated = true

    renderFooter()

    expect(
      screen.getByRole('link', { name: /my profile/i })
    ).toHaveAttribute('href', '/profile')

    expect(
      screen.getByRole('link', { name: /my orders/i })
    ).toHaveAttribute('href', '/my-orders')

    expect(
      screen.queryByRole('link', { name: /login/i })
    ).not.toBeInTheDocument()
  })

  it('displays the admin dashboard link for administrators', () => {
    authMocks.isAuthenticated = true
    authMocks.isAdmin = true

    renderFooter()

    expect(
      screen.getByRole('link', { name: /admin dashboard/i })
    ).toHaveAttribute('href', '/admin')

    expect(
      screen.queryByRole('link', { name: /my profile/i })
    ).not.toBeInTheDocument()
  })

  it('displays loading text while authentication is loading', () => {
    authMocks.loading = true

    renderFooter()

    expect(
      screen.getByText(/loading account/i)
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: /login/i })
    ).not.toBeInTheDocument()
  })

  it('displays the contact information', () => {
    renderFooter()

    expect(
      screen.getByText('Nairobi, Kenya')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /enockkipkirui003@gmail.com/i,
      })
    ).toHaveAttribute('href', 'mailto:enockkipkirui003@gmail.com')

    expect(
      screen.getByText('0726779485')
    ).toBeInTheDocument()
  })

  it('displays the Contact Us heading', () => {
    renderFooter()

    expect(
      screen.getByRole('heading', { name: /contact us/i })
    ).toBeInTheDocument()
  })

  it('displays the Facebook social link', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /facebook/i })
    ).toHaveAttribute('href', 'https://facebook.com')
  })

  it('displays the Instagram social link', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /instagram/i })
    ).toHaveAttribute('href', 'https://instagram.com')
  })

  it('displays the X social link', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /^x$/i })
    ).toHaveAttribute('href', 'https://x.com')
  })

  it('displays the current year in the copyright notice', () => {
    renderFooter()

    expect(
      screen.getByText(
        new RegExp(`©\\s*${new Date().getFullYear()}`)
      )
    ).toBeInTheDocument()
  })

  it('displays the developer credit', () => {
    renderFooter()

    expect(
      screen.getByText(/made by/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Enock♥/i)
    ).toBeInTheDocument()
  })
})
