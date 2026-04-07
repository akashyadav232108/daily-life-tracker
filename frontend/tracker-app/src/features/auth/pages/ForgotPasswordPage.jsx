import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * ForgotPasswordPage — Step 1 of 3.
 *
 * User enters their registered email.
 * Backend generates OTP and sends it via email.
 * On success → navigate to /verify-otp (passing email in state).
 */
const ForgotPasswordPage = () => {
  const navigate  = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      // Always show success — backend never reveals if email exists
      toast.success('OTP sent! Check your inbox (and spam folder).');
      // Pass email via navigation state to OTP page
      navigate('/verify-otp', { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Daily Tracker</h1>
          <p className="mt-2 text-gray-500">Track your daily life, one step at a time</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* Step indicator: 1 of 3 */}
          <StepIndicator current={1} />

          <h2 className="mb-1 text-xl font-semibold text-gray-900">Forgot your password?</h2>
          <p className="mb-6 text-sm text-gray-500">
            Enter your registered email address and we'll send you a 6-digit OTP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <><LoadingSpinner size="sm" /> Sending OTP...</> : 'Send OTP'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/** Shared 3-step progress indicator used across all 3 forgot-password pages. */
export const StepIndicator = ({ current }) => {
  const steps = ['Email', 'Verify OTP', 'New Password'];
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((label, idx) => {
        const stepNum  = idx + 1;
        const done     = stepNum < current;
        const active   = stepNum === current;
        return (
          <div key={stepNum} className="flex flex-1 items-center">
            {/* Circle */}
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors
              ${done   ? 'bg-primary text-white'
              : active ? 'bg-primary text-white'
              :          'bg-gray-200 text-gray-500'}`}>
              {done ? '✓' : stepNum}
            </div>
            {/* Label (hidden on very small screens) */}
            <span className={`ml-1.5 hidden text-xs sm:inline ${active ? 'font-semibold text-primary' : done ? 'text-gray-500' : 'text-gray-400'}`}>
              {label}
            </span>
            {/* Connector line (not after last step) */}
            {idx < steps.length - 1 && (
              <div className={`ml-2 h-0.5 flex-1 rounded transition-colors ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ForgotPasswordPage;
