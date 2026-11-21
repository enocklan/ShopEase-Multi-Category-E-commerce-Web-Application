
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth()

  // Wait until Supabase finishes checking the user's session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50">
        <p className="text-lg font-medium text-green-800">
          Checking administrator access...
        </p>
      </div>
    )
  }

  // Redirect users who are not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect logged-in customers who are not administrators
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // Allow authorized administrators to access child routes
  return <Outlet />
}

export default AdminRoute
