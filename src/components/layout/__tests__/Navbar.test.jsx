
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Navbar from '../Navbar'

const mocks = vi.hoisted(() => ({
  isAuthenticated: false,
  cartCount: 0,
  logoutUser: vi.fn(),
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mocks.isAuthenticated,
  }),
}))

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({
    cartCount: mocks.cartCount,
  }),
}))

vi.mock('../../../services/authService', () => ({
  logoutUser: mocks.logoutUser,
}))

const LocationDisplay = () => {
  const location = useLocation()

  return (
    <div data-testid="current-location">
      {location.pathname}{location.search}
    </div>
  )
}

const renderNavbar = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar />
      <LocationDisplay />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    mocks.isAuthenticated = false
    mocks.cartCount = 0
    mocks.logoutUser.mockReset()
    mocks.logoutUser.mockResolvedValue({})
  })

  it('displays the ShopEase logo', () => {
    renderNavbar()

    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Ease')).toBeInTheDocument()
  })

  it('displays the main navigation links', () => {
    renderNavbar()

    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Products' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Categories' }).length).toBeGreaterThan(0)
  })

  it('displays Login and Register links for guests', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
  })

  it('does not display customer account links for guests', () => {
    renderNavbar()

    expect(screen.queryByRole('link', { name: 'My Account' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'My Orders' })).not.toBeInTheDocument()
  })

  it('displays the shopping cart link', () => {
    renderNavbar()

    expect(
      screen.getAllByRole('link', { name: /Shopping cart with 0 items/i })
    ).toHaveLength(2)
  })

  it('displays the cart item count', () => {
    mocks.cartCount = 3

    renderNavbar()

    expect(screen.getAllByText('3')).toHaveLength(2)
  })

  it('limits the cart badge to 99+', () => {
    mocks.cartCount = 120

    renderNavbar()

    expect(screen.getAllByText('99+')).toHaveLength(2)
  })

  it('displays customer links when authenticated', () => {
    mocks.isAuthenticated = true

    renderNavbar()

    expect(screen.getByRole('link', { name: 'My Account' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'My Orders' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('does not display Login and Register links when authenticated', () => {
    mocks.isAuthenticated = true

    renderNavbar()

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument()
  })

  it('opens the mobile menu when the menu button is clicked', async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('closes the mobile menu when the close button is clicked', async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Create Account' })).not.toBeInTheDocument()
  })

  it('searches for products and navigates to the results', async () => {
    const user = userEvent.setup()

    renderNavbar()

    const searchInputs = screen.getAllByPlaceholderText('Search products...')

    await user.type(searchInputs[0], 'Green Shoes')
    fireEvent.submit(searchInputs[0].closest('form'))

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/products?search=Green%20Shoes'
    )
  })

  it('does not navigate when the search field is empty', async () => {
    const user = userEvent.setup()

    renderNavbar()

    const searchInputs = screen.getAllByPlaceholderText('Search products...')

    await user.type(searchInputs[0], '   ')
    fireEvent.submit(searchInputs[0].closest('form'))

    expect(screen.getByTestId('current-location')).toHaveTextContent('/')
  })

  it('closes the mobile menu after submitting a search', async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    const searchInputs = screen.getAllByPlaceholderText('Search products...')
    await user.type(searchInputs[1], 'Phones')
    fireEvent.submit(searchInputs[1].closest('form'))

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/products?search=Phones'
    )
  })

  it('logs out the user and redirects to login', async () => {
    const user = userEvent.setup()
    mocks.isAuthenticated = true

    renderNavbar()

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(mocks.logoutUser).toHaveBeenCalledOnce()
      expect(screen.getByTestId('current-location')).toHaveTextContent('/login')
    })
  })

  it('closes the mobile menu after logout', async () => {
    const user = userEvent.setup()
    mocks.isAuthenticated = true

    renderNavbar()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    const logoutButtons = screen.getAllByRole('button', { name: 'Logout' })
    await user.click(logoutButtons[1])

    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('/login')
    })

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })
})
