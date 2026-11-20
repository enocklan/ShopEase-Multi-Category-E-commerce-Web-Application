
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

// Public pages
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'

// Shopping pages
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import ProductDetails from '../pages/ProductDetails'
import CategoryDetails from '../pages/CategoryDetails'
import Cart from '../pages/Cart'

// Customer pages
import Checkout from '../pages/Checkout'
import Profile from '../pages/Profile'
import MyOrders from '../pages/MyOrders'

// Layout
import MainLayout from '../components/layout/MainLayout'

// Protected routes
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Pages without the main Navbar and Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Pages using the shared Navbar and Footer */}
        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />
          <Route
            path="/products/:slug"
            element={<ProductDetails />}
          />

          <Route path="/categories" element={<Categories />} />
          <Route
            path="/categories/:slug"
            element={<CategoryDetails />}
          />

          <Route path="/cart" element={<Cart />} />

          {/* Protected customer pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

        </Route>

        {/* Unknown pages */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
