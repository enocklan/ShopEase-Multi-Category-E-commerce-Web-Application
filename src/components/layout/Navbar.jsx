
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../services/authService'

const Navbar = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSearch = (event) => {
    event.preventDefault()

    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logoutUser()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="rounded-xl bg-green-600 p-2 text-white">
            <ShoppingBag size={25} />
          </div>

          <span className="text-2xl font-bold text-gray-900">
            Shop<span className="text-green-600">Ease</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-xs flex-1 lg:flex"
        >
          <div className="flex w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3 focus-within:border-green-500">
            <Search size={18} className="text-gray-400" />

            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative text-gray-600 transition hover:text-green-700"
          >
            <ShoppingCart size={23} />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-700"
              >
                <User size={19} />
                My Account
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                {loggingOut ? 'Signing out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-green-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-green-50 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-green-100 bg-white px-4 py-5 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
              <Search size={18} className="text-gray-400" />

              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent px-2 py-3 text-sm outline-none"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? 'text-green-700' : 'text-gray-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <ShoppingCart size={18} />
              Shopping Cart
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  My Account
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-left text-sm font-medium text-red-600"
                >
                  {loggingOut ? 'Signing out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
