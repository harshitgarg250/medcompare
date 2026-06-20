import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
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
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="px-4 py-3 flex justify-between items-center max-w-6xl mx-auto">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-lg font-extrabold text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
            +
          </span>
          <span>MedCompare</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/hospitals"
            className={navLinkClass("/hospitals")}
          >
            Hospitals
          </Link>
          {user && (
            <>
              <Link
                to="/my-bookings"
                className={navLinkClass("/my-bookings")}
              >
                My Bookings
              </Link>
              <Link
                to="/reports"
                className={navLinkClass("/reports")}
              >
                📋 Reports
              </Link>
            </>
          )}
          {user ? (
            <div className="ml-2 flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 p-1">
              <span className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm font-bold text-gray-700 shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-700">
                  {userInitial}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 transition hover:bg-red-50 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="ml-2 flex gap-2">
              <Link
                to="/login"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-teal-300 hover:text-teal-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex md:hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-extrabold shadow-sm transition ${
            menuOpen
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-700"
          }`}
          aria-label="Menu"
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className={`text-base transition ${menuOpen ? "rotate-45" : ""}`}>+</span>
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-[65px] z-40 bg-gray-900/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile command panel */}
      {menuOpen && (
        <div className="absolute left-3 right-3 top-[68px] z-50 md:hidden">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            {user && (
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-sm font-extrabold text-white">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-gray-800">{user.name}</div>
                  <div className="text-xs font-semibold text-teal-700">Signed in</div>
                </div>
              </div>
            )}

            <div className="grid gap-2 p-3">
              <Link
                to="/hospitals"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                  isActive("/hospitals") ? "bg-teal-50 text-teal-700" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>Find Hospitals</span>
                <span className="text-lg">→</span>
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                      isActive("/my-bookings") ? "bg-teal-50 text-teal-700" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>My Bookings</span>
                    <span className="text-lg">→</span>
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                      isActive("/reports") ? "bg-teal-50 text-teal-700" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>📋 Reports</span>
                    <span className="text-lg">→</span>
                  </Link>
                </>
              )}
            </div>

            {user ? (
              <div className="border-t border-gray-100 p-3">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-2xl bg-red-50 py-3 text-sm font-extrabold text-red-500 transition hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-gray-200 py-3 text-center text-sm font-extrabold text-gray-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-gray-900 py-3 text-center text-sm font-extrabold text-white"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
