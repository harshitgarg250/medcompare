import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-teal-600">
        🏥 MedCompare
      </Link>
      <div className="flex gap-4 items-center">
        <Link to="/hospitals" className="text-gray-600 hover:text-teal-600 text-sm">
          Hospitals
        </Link>
        {user ? (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar