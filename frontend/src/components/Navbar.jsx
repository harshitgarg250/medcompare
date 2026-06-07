import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar() {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="text-lg font-bold text-teal-600 flex items-center gap-1">
          🏥 MedCompare
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link to="/hospitals" className="text-sm text-gray-600 hover:text-teal-600">Hospitals</Link>
          {user && <Link to="/my-bookings" className="text-sm text-gray-600 hover:text-teal-600">My Bookings</Link>}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">👤 {user.name}</span>
              <button onClick={logout} className="text-sm bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">Login</Link>
              <Link to="/register" className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger - sirf mobile pe */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-1.5 p-2"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="flex md:hidden flex-col bg-white border-t border-gray-100 px-4 py-3 gap-2">
          <Link to="/hospitals" onClick={() => setMenuOpen(false)} className="py-3 text-sm text-gray-700 border-b border-gray-100">🏥 Hospitals</Link>
          {user && <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="py-3 text-sm text-gray-700 border-b border-gray-100">📋 My Bookings</Link>}
          {user ? (
            <>
              <div className="py-2 text-sm text-gray-500">👤 {user.name}</div>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="py-2.5 text-sm bg-red-50 text-red-500 rounded-xl border border-red-100">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 py-2.5 text-sm text-center border border-gray-200 text-gray-600 rounded-xl">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 py-2.5 text-sm text-center bg-teal-600 text-white rounded-xl">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar