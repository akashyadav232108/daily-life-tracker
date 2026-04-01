import { useSelector } from 'react-redux';
import { selectAuth, selectUser, selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';
import { ROLES } from '../utils/constants';

/**
 * Custom hook for accessing auth state and role-based checks
 */
const useAuth = () => {
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  return {
    ...auth,
    user,
    isAuthenticated,
    role,
    isAdmin,
    isSuperAdmin,
  };
};

export default useAuth;
