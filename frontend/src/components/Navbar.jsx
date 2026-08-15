import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isActive = (path) => location.pathname === path;
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const navLinkClass = (path) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive(path)
        ? "bg-teal-50 text-teal-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-teal-700"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-lg font-extrabold text-gray-900 hover:opacity-80 transition"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md">
            🏥
          </span>
          <span>MedCompare</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/hospitals" className={navLinkClass("/hospitals")}>
            Hospitals
          </Link>
          
          {user && (
            <>
              <Link to="/my-bookings" className={navLinkClass("/my-bookings")}>
                My Bookings
              </Link>
              <Link to="/reports" className={navLinkClass("/reports")}>
                📋 Reports
              </Link>
              <Link to="/compare" className={navLinkClass("/compare")}>
                ⚖️ Compare
              </Link>
              <Link 
                to="/ai-chat" 
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive("/ai-chat")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                💬 AI Chat
              </Link>
            </>
          )}

          {/* Auth Section */}
          {user ? (
            <div className="ml-4 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1.5">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow-md hover:text-teal-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-teal-200 text-xs font-bold text-teal-700">
                  {userInitial}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </button>
              <button
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                title="Logout"
              >
                ↗
              </button>
            </div>
          ) : (
            <div className="ml-4 flex gap-2">
              <Link
                to="/login"
                className="rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:from-teal-700 hover:to-teal-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex md:hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-extrabold shadow-sm transition ${
            menuOpen
              ? "border-teal-300 bg-teal-50 text-teal-700"
              : "border-gray-300 bg-white text-gray-700"
          }`}
          aria-label="Menu"
        >
          <span>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-[65px] z-40 bg-gray-900/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="absolute left-3 right-3 top-[68px] z-50 md:hidden">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
            {/* User Info Section */}
            {user && (
              <div className="flex items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-extrabold text-white">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-xs font-semibold text-teal-700">
                    Signed in ✓
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="grid gap-1 p-3">
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </Link>
              )}

              <Link
                to="/hospitals"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive("/hospitals")
                    ? "bg-teal-50 text-teal-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🏥 Find Hospitals</span>
                <span className="text-lg">→</span>
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive("/my-bookings")
                        ? "bg-teal-50 text-teal-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>📅 My Bookings</span>
                    <span className="text-lg">→</span>
                  </Link>

                  <Link
                    to="/reports"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive("/reports")
                        ? "bg-teal-50 text-teal-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>📋 Reports</span>
                    <span className="text-lg">→</span>
                  </Link>

                  <Link
                    to="/compare"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive("/compare")
                        ? "bg-teal-50 text-teal-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>⚖️ Compare Prices</span>
                    <span className="text-lg">→</span>
                  </Link>

                  <Link
                    to="/ai-chat"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive("/ai-chat")
                        ? "bg-blue-50 text-blue-700"
                        : "bg-white text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span>💬 AI Chat Assistant</span>
                    <span className="text-lg">→</span>
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            {!user && !isAuthPage && (
              <div className="grid grid-cols-2 gap-2 border-t border-gray-200 p-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border-2 border-gray-300 py-3 text-center text-sm font-bold text-gray-700 transition hover:border-teal-400 hover:text-teal-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-center text-sm font-bold text-white transition hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <div className="border-t border-gray-200 p-3">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-2xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;