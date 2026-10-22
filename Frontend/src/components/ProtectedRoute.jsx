import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard that checks authentication and optional role-based access.
 *
 * Usage:
 *   <ProtectedRoute>                          — any authenticated user
 *   <ProtectedRoute allowedRoles={["admin"]}> — admin only
 *   <ProtectedRoute allowedRoles={["user"]}>  — students only
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Wait for auth state to hydrate from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to their home page
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "instructor") return <Navigate to="/instructor" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default ProtectedRoute;
