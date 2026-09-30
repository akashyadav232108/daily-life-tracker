import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import RegisterPromptModal from '../components/RegisterPromptModal';

const RegisterPromptContext = createContext(null);

/**
 * Provides requireAuth() for guest-gated mutations.
 * Authenticated users pass through; guests see a register prompt (no API call).
 */
export const RegisterPromptProvider = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [returnPath, setReturnPath] = useState('/');

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    setReturnPath(`${location.pathname}${location.search}`);
    setIsOpen(true);
    return false;
  }, [isAuthenticated, location.pathname, location.search]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleRegister = useCallback(() => {
    setIsOpen(false);
    navigate('/register', { state: { from: returnPath } });
  }, [navigate, returnPath]);

  const handleLogin = useCallback(() => {
    setIsOpen(false);
    navigate('/login', { state: { from: returnPath } });
  }, [navigate, returnPath]);

  const value = useMemo(
    () => ({ requireAuth, isAuthenticated }),
    [requireAuth, isAuthenticated]
  );

  return (
    <RegisterPromptContext.Provider value={value}>
      {children}
      <RegisterPromptModal
        isOpen={isOpen}
        onClose={handleClose}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />
    </RegisterPromptContext.Provider>
  );
};

export const useRequireAuth = () => {
  const ctx = useContext(RegisterPromptContext);
  if (!ctx) {
    throw new Error('useRequireAuth must be used within RegisterPromptProvider');
  }
  return ctx;
};
