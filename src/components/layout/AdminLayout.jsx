
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-green-50">
      {/* Admin sidebar */}
      <Sidebar />

      {/* Admin page content */}
      <main className="min-w-0 flex-1 overflow-x-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
