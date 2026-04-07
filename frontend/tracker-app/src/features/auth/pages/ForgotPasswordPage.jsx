import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * ForgotPasswordPage — 2-step password reset via OTP.
 *
 * Step 1 — Enter Email:
 *   User types registered email → POST /api/auth/forgot-password
 *   Backend generates OTP, stores in Redis, sends email.
 *
 * Step 2 — Enter OTP + New Password:
 *   User types OTP (from email) + new password → POST /api/auth/reset-password
 *   Backend verifies OTP, updates password, invalidates OTP.
 *   On success → redirect to /login.
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────
  const [step, setStep]           = useState(1);   // 1 = email, 2 = OTP + new password
  const [loading, setLoading]     = useState(false);
  const [email, setEmail]         = useState('');

  // Step 2 fields
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Step 1: Request OTP ────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      // Always show success — backend never reveals if email is registered
      toast.success('OTP sent! Check your inbox (and spam folder).');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP + Reset Password ───────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (otp.trim().length !== 6) {
      toast.error('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success('Password reset successfully! You can now sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input class ─────────────────────────────────────────
  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  // ══════════════════════════════════════════════════════════════
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

          {/* ── Step indicator ── */}
          <div className="mb-6 flex items-center gap-3">
            {/* Step 1 dot */}
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
              ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            {/* Connector line */}
            <div className={`h-0.5 flex-1 rounded ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`} />
            {/* Step 2 dot */}
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
              ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>

          {/* ── STEP 1: Enter Email ── */}
          {step === 1 && (
            <>
              <h2 className="mb-1 text-xl font-semibold text-gray-900">Forgot your password?</h2>
              <p className="mb-6 text-sm text-gray-500">
                Enter your registered email and we'll send you a 6-digit OTP to reset your password.
              </p>

              <form onSubmit={handleRequestOtp} className="space-y-5">
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
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputCls}
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
            </>
          )}

          {/* ── STEP 2: Enter OTP + New Password ── */}
          {step === 2 && (
            <>
              <h2 className="mb-1 text-xl font-semibold text-gray-900">Enter OTP & new password</h2>
              <p className="mb-1 text-sm text-gray-500">
                We sent a 6-digit OTP to{' '}
                <span className="font-medium text-gray-700">{email}</span>.
              </p>
              <p className="mb-6 text-xs text-gray-400">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Go back and try again
                </button>
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">

                {/* OTP */}
                <div>
                  <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    className={`${inputCls} text-center text-xl tracking-[0.5em] font-mono`}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className={`${inputCls} ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                        : ''
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <><LoadingSpinner size="sm" /> Resetting...</> : 'Reset Password'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Back to{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
