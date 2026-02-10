import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

function Navbar() {
  const { user, logout, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthLoading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-linear-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">LMS</span>
          </div>
          <span className="text-white font-bold text-xl hidden sm:inline">
            Learning Hub
          </span>
        </Link>

        {/* Navigation (only when logged in) */}
        {user && (
          <ul className="hidden md:flex space-x-1">
            <li>
              <Link
                to="/"
                className="px-4 py-2 text-white font-medium rounded-lg hover:bg-white/20 transition"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="px-4 py-2 text-white font-medium rounded-lg hover:bg-white/20 transition"
              >
                Courses
              </Link>
            </li>
            {user.is_staff && (
              <li>
                <Link
                  to="/admin"
                  className="px-4 py-2 text-white font-medium rounded-lg hover:bg-white/20 transition"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-white text-sm font-medium hidden sm:inline">
              {user.username}
            </span>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-md"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
