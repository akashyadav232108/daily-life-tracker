import { Link, useLocation } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';

/**
 * Subtle banner for guest users — does not block layout on any breakpoint.
 */
const GuestBanner = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return null;

  const from = `${location.pathname}${location.search}`;

  return (
    <div
      className="mb-4 flex flex-col gap-2 rounded-xl border border-teal-100 bg-gradient-to-r
                 from-teal-50/90 to-sky-50/80 px-3 py-2.5 text-sm text-teal-900
                 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
    >
      <div className="flex min-w-0 items-start gap-2 sm:items-center">
        <HiSparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 sm:mt-0" />
        <p className="leading-snug">
          You&apos;re browsing as a guest. Explore freely — register when you&apos;re ready to begin.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
        <Link
          to="/register"
          state={{ from }}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white
                     transition-colors hover:bg-teal-700"
        >
          Register
        </Link>
        <Link
          to="/login"
          state={{ from }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-teal-800
                     transition-colors hover:bg-teal-100/80"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default GuestBanner;
