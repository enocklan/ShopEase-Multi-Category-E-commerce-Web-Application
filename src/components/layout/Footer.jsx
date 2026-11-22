
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isAuthenticated, isAdmin, loading } = useAuth()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="rounded-xl bg-green-600 p-2 text-white">
                <ShoppingBag size={23} />
              </div>

              <span className="text-2xl font-bold text-white">
                Shop<span className="text-green-400">Ease</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-gray-400">
              Your everyday shopping destination. Discover quality products
              at affordable prices and enjoy a simple shopping experience.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 font-bold text-white transition hover:bg-green-600"
              >
                f
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white transition hover:bg-green-600"
              >
                IG
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 font-bold text-white transition hover:bg-green-600"
              >
                X
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="transition hover:text-green-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition hover:text-green-400">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="transition hover:text-green-400">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-green-400">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

         {/* Customer Account */}
<div>
  <h3 className="mb-5 text-lg font-semibold text-white">
    My Account
  </h3>

  {loading ? (
    <p className="text-sm text-gray-400">
      Loading account...
    </p>
  ) : (
    <ul className="space-y-3 text-sm">
      {!isAuthenticated ? (
        <>
          <li>
            <Link to="/login" className="transition hover:text-green-400">
              Login
            </Link>
          </li>

          <li>
            <Link to="/register" className="transition hover:text-green-400">
              Create Account
            </Link>
          </li>
        </>
      ) : isAdmin ? (
        <li>
          <Link
            to="/admin"
            className="transition hover:text-green-400"
          >
            Admin Dashboard
          </Link>
        </li>
      ) : (
        <>
          <li>
            <Link to="/profile" className="transition hover:text-green-400">
              My Profile
            </Link>
          </li>

          <li>
            <Link to="/my-orders" className="transition hover:text-green-400">
              My Orders
            </Link>
          </li>
        </>
      )}
    </ul>
  )}
</div>
          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={19} className="shrink-0 text-green-400" />
                <span>Nairobi, Kenya</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={19} className="shrink-0 text-green-400" />
                <a
                  href="mailto:enockkipkirui003@gmail.com"
                  className="transition hover:text-green-400"
                >
                  enockkipkirui003@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={19} className="shrink-0 text-green-400" />
                <span>0726779485</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-6 text-center text-sm sm:flex-row">
          <p className="text-gray-400">
            © {currentYear} ShopEase. All rights reserved.
          </p>

          <p className="text-gray-400">
            Made by <span className="text-green-400">Enock♥ </span> Kenya
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
