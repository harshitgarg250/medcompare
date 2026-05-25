import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-teal-600">
        🏥 MedCompare
      </Link>
      <div className="flex gap-4 items-center">
        <Link to="/hospitals" className="text-gray-600 hover:text-teal-600 text-sm">
          Hospitals
        </Link>
        {user && (
          <Link to="/my-bookings" className="text-gray-600 hover:text-teal-600 text-sm">
            My Bookings
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">👤 {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-teal-400 hover:text-teal-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar