
import { Navigate, Outlet } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageProducts from '../pages/admin/ManageProducts'
import AddProduct from '../pages/admin/AddProduct'
import ManageCategories from '../pages/admin/ManageCategories'
import ManageOrders from '../pages/admin/ManageOrders'
import ManageCustomers from '../pages/admin/ManageCustomers'
import ManagePayments from '../pages/admin/ManagePayments'

const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <p className="p-6 text-center">Checking administrator access...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<ManageProducts />} />
      <Route path="products/add" element={<AddProduct />} />
      <Route path="categories" element={<ManageCategories />} />
      <Route path="orders" element={<ManageOrders />} />
      <Route path="customers" element={<ManageCustomers />} />
      <Route path="payments" element={<ManagePayments />} />
    </Routes>
  )
}

export default AdminRoute
