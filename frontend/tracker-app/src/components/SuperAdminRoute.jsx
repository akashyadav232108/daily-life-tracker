import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

/**
 * Route guard — only allows SUPER_ADMIN.
 *
 * Behaviour:
 *  - Not authenticated at all  → redirect to /login (ProtectedRoute handles this; wrap inside it)
 *  - Authenticated but not admin → redirect to / with error toast
 *  - Authenticated ADMIN (not super) → redirect to /admin with error toast
 *  - SUPER_ADMIN → renders children
 *
 * Usage:
 *   <ProtectedRoute>
 *     <SuperAdminRoute>
 *       <PageLayout><SomeSuperAdminPage /></PageLayout>
 *     </SuperAdminRoute>
 *   </ProtectedRoute>
 */
const SuperAdminRoute = ({ children }) => {
  const { isAdmin, isSuperAdmin } = useAuth();

  if (!isAdmin) {
    toast.error('Access denied — admin privileges required');
    return <Navigate to="/" replace />;
  }

  if (!isSuperAdmin) {
    toast.error('Access denied — Super Admin privileges required');
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default SuperAdminRoute;
