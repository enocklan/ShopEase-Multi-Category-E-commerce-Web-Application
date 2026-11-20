
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Cart from '../pages/Cart'
import Products from '../pages/Products'
import Categories from '../pages/Categories'
import ProductDetails from '../pages/ProductDetails'
import CategoryDetails from '../pages/CategoryDetails'
import Checkout from '../pages/Checkout'

import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shopping pages */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />

        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetails />} />

        <Route path="/cart" element={<Cart />} />

        {/* Protected customer pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* Unknown pages */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
