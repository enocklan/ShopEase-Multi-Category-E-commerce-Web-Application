
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

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

            <div className="mt-5 flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                aria-label="Facebook" className="hover:text-green-400">
                <Facebook size={20} />
              </a>

              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                aria-label="Instagram" className="hover:text-green-400">
                <Instagram size={20} />
              </a>

              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                aria-label="Twitter" className="hover:text-green-400">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-green-400">Home</Link></li>
              <li><Link to="/products" className="hover:text-green-400">Products</Link></li>
              <li><Link to="/categories" className="hover:text-green-400">Categories</Link></li>
              <li><Link to="/cart" className="hover:text-green-400">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Customer Account */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              My Account
            </h3>

            <ul className="space-y-3 text-sm">
              <li><Link to="/login" className="hover:text-green-400">Login</Link></li>
              <li><Link to="/register" className="hover:text-green-400">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-green-400">My Profile</Link></li>
              <li><Link to="/my-orders" className="hover:text-green-400">My Orders</Link></li>
            </ul>
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
                <a href="mailto:support@shopease.com" className="hover:text-green-400">
                  support@shopease.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={19} className="shrink-0 text-green-400" />
                <span>Customer Support</span>
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
            Made with <span className="text-green-400">♥</span> in Kenya
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
