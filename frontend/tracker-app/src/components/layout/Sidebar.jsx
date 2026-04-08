import { NavLink } from 'react-router-dom';
import {
  HiHome,
  HiClipboardDocumentList,
  HiHeart,
  HiBolt,
  HiCurrencyDollar,
  HiBell,
  HiShieldCheck,
  HiUsers,
  HiXMark,
} from 'react-icons/hi2';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../../features/notifications/notificationSlice';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { to: '/', icon: HiHome, label: 'Dashboard' },
  { to: '/tasks', icon: HiClipboardDocumentList, label: 'Tasks' },
  { to: '/health', icon: HiHeart, label: 'Health' },
  { to: '/exercise', icon: HiBolt, label: 'Exercise' },
  { to: '/expenses', icon: HiCurrencyDollar, label: 'Expenses' },
  { to: '/notifications', icon: HiBell, label: 'Notifications', badge: true },
];

const adminItems = [
  { to: '/admin', icon: HiShieldCheck, label: 'Admin Tasks' },
  { to: '/admin/users', icon: HiUsers, label: 'User Management' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const unreadCount = useSelector(selectUnreadCount);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sidebar-active text-white'
        : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-white">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.comingSoon ? '#' : item.to}
              end={item.to === '/'}
              className={item.comingSoon ? () =>
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed'
                : linkClass
              }
              onClick={(e) => {
                if (item.comingSoon) e.preventDefault();
                else onClose();
              }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-[10px] text-gray-400">
                  Soon
                </span>
              )}
              {item.badge && unreadCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Admin
              </p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.comingSoon ? '#' : item.to}
                  className={item.comingSoon ? () =>
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed'
                    : linkClass
                  }
                  onClick={(e) => {
                    if (item.comingSoon) e.preventDefault();
                    else onClose();
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.comingSoon && (
                    <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-[10px] text-gray-400">
                      Soon
                    </span>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full border-t border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-500">Daily Life Tracker v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
