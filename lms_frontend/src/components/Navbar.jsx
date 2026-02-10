import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();

  return (
    <nav className="w-full flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <Link to="/" className="font-bold text-xl text-gray-800">
        My LMS
      </Link>
      <ul className="flex items-center gap-2">
        <li>
          <Link to="/" className="p-2 rounded-md hover:bg-gray-100 font-medium">
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/courses"
            className="p-2 rounded-md hover:bg-gray-100 font-medium"
          >
            Courses
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className="p-2 rounded-md hover:bg-gray-100 font-medium"
          >
            Profile
          </Link>
        </li>
        <li>
          <Link
            to="/admin"
            className="p-2 rounded-md hover:bg-gray-100 font-medium"
          >
            Dashboard
          </Link>
        </li>
        <li className="ml-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600 mr-2">
                {user.username} ({user.role})
              </span>
              <button
                type="button"
                onClick={logout}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
