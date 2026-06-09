import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center max-w-6xl mx-auto">
        <Link
          to="/"
          className="text-lg font-bold text-teal-600 flex items-center gap-1"
        >
          🏥 MedCompare
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link
            to="/hospitals"
            className="text-sm text-gray-600 hover:text-teal-600"
          >
            Hospitals
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              className="text-sm text-gray-600 hover:text-teal-600"
            >
              My Bookings
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 truncate max-w-[120px]">
                👤 {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-teal-400 hover:text-teal-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="flex md:hidden flex-col bg-white border-t border-gray-100 px-4 py-3 gap-1">
          {/* Hospitals — hamesha dikhe */}
          <Link
            to="/hospitals"
            onClick={() => setMenuOpen(false)}
            className="py-3 px-2 text-sm text-gray-700 font-medium flex items-center gap-2 rounded-xl hover:bg-gray-50"
          >
            🏥 Find Hospitals
          </Link>

          {/* My Bookings — sirf logged in user ke liye */}
          {user && (
            <Link
              to="/my-bookings"
              onClick={() => setMenuOpen(false)}
              className="py-3 px-2 text-sm text-gray-700 font-medium flex items-center gap-2 rounded-xl hover:bg-gray-50"
            >
              📋 My Bookings
            </Link>
          )}

          {/* User section */}
          {user ? (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="px-2 py-1 text-xs text-gray-400 mb-2">
                👤 {user.name}
              </div>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full py-2.5 text-sm bg-red-50 text-red-500 rounded-xl border border-red-100 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex gap-2 pt-2 mt-2 border-t border-gray-100">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2.5 text-sm text-center border border-gray-200 text-gray-600 rounded-xl font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2.5 text-sm text-center bg-teal-600 text-white rounded-xl font-medium"
                >
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
