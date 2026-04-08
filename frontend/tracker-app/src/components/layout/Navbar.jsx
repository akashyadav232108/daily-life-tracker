import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiUserCircle, HiArrowRightOnRectangle, HiBars3, HiCog6Tooth, HiExclamationTriangle } from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';
import { clearCredentials } from '../../features/auth/authSlice';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  // Open confirmation modal
  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  // User confirmed logout
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    dispatch(clearCredentials());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // User cancelled logout
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
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
          {/* Live notification bell with dropdown */}
          <NotificationDropdown />

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
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    user?.role === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : user?.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <HiCog6Tooth className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={handleLogoutClick}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            {/* Icon + Title */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <HiExclamationTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>

            <p className="mb-6 text-sm text-gray-500">
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogoutCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                No, Stay
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <HiArrowRightOnRectangle className="h-4 w-4" />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
