import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiBell, HiUserCircle, HiArrowRightOnRectangle, HiBars3 } from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';
import { clearCredentials } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left — hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <HiBars3 className="h-6 w-6" />
        </button>
        <h1
          className="cursor-pointer text-xl font-bold text-primary"
          onClick={() => navigate('/')}
        >
          Daily Tracker
        </h1>
      </div>

      {/* Right — notification bell + user menu */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder — Phase 5) */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <HiBell className="h-5 w-5" />
          {/* Badge will be added in Phase 5 */}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            <HiUserCircle className="h-6 w-6" />
            <span className="hidden text-sm font-medium sm:block">
              {user?.fullName || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <HiArrowRightOnRectangle className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
