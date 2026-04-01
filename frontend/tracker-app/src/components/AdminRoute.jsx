import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

/**
 * Route guard — only allows ADMIN and SUPER_ADMIN.
 * Redirects non-admin users to dashboard with a toast message.
 * Must be wrapped inside ProtectedRoute (assumes user is authenticated).
 */
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    toast.error('Access denied — admin privileges required');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
