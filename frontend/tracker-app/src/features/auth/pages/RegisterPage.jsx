import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import RegisterForm from '../components/RegisterForm';
import { HiBolt, HiShieldCheck, HiChartBar, HiSparkles, HiArrowLeft } from 'react-icons/hi2';

const perks = [
  { icon: HiShieldCheck, text: 'Your data is private & secure' },
  { icon: HiChartBar,    text: 'Visual progress tracking' },
  { icon: HiSparkles,    text: 'Daily streaks & habit building' },
  { icon: HiBolt,        text: 'Works across all your devices' },
];

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleBack = () => {
    if (location.state?.from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a5f 50%, #0f766e 100%)',
        }}
      >
        {/* Decorative blurs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 border border-white/20">
            <HiBolt className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Daily Tracker</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Start your journey
              <br />
              <span className="text-teal-300">today. It's free.</span>
            </h1>
            <p className="mt-4 text-lg text-teal-100/80 leading-relaxed max-w-sm">
              Join thousands of people building better daily habits — one small step at a time.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <Icon className="h-3.5 w-3.5 text-teal-300" />
                </div>
                <span className="text-sm text-teal-100">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 pt-2">
            {[['Free', 'Forever'], ['2 min', 'Setup'], ['No', 'Credit Card']].map(([val, lbl]) => (
              <div key={lbl} className="flex flex-col items-center rounded-2xl bg-white/10 px-4 py-3 border border-white/20">
                <span className="text-lg font-bold text-white">{val}</span>
                <span className="text-xs text-teal-200 mt-0.5">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-sm text-teal-300 italic">
          "The secret of getting ahead is getting started."
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-10 sm:px-12 sm:py-12">
        <div className="mb-6 w-full max-w-[420px] sm:mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-teal-100
                       bg-white px-3 py-2 text-sm font-medium text-teal-800 shadow-sm
                       transition-all hover:border-teal-200 hover:bg-teal-50/70 hover:text-teal-900
                       focus:outline-none focus:ring-2 focus:ring-teal-200/80"
          >
            <HiArrowLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">Continue browsing</span>
          </button>
        </div>

        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2 sm:mb-8 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
            <HiBolt className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Daily Tracker</span>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                state={{ from }}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* RegisterForm — all logic unchanged */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
