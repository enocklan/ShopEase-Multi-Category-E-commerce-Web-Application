
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tags,
  ShoppingCart,
  Users,
  CreditCard,
  Store,
  LogOut,
  ArrowLeft,
} from 'lucide-react'

import { supabase } from '../../supabase/client'

const Sidebar = () => {
  const navigate = useNavigate()

  const navigation = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Manage Products',
      path: '/admin/products',
      icon: Package,
    },
    {
      name: 'Add Product',
      path: '/admin/products/add',
      icon: PlusCircle,
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: Tags,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Payments',
      path: '/admin/payments',
      icon: CreditCard,
    },
  ]

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-green-950 text-white">
      {/* Brand */}
      <div className="border-b border-green-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-500 p-2">
            <Store size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold">ShopEase</h1>
            <p className="text-xs text-green-300">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-green-400">
          Administration
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-500 text-white shadow'
                    : 'text-green-100 hover:bg-green-900'
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-2 border-t border-green-800 p-4">
        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-green-100 transition hover:bg-green-900"
        >
          <ArrowLeft size={19} />
          Back to Store
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-300 transition hover:bg-red-950"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
