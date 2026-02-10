import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

/**
 * Protects routes: redirects to /login if not authenticated.
 * Optional role prop to restrict by role (e.g. role="admin").
 */
export default function ProtectedRoute({ children, role }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
