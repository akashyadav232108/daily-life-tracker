import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { StepIndicator } from './ForgotPasswordPage';

/**
 * ResetPasswordPage — Step 3 of 3.
 *
 * Receives resetToken via navigation state from OtpVerifyPage.
 * If no resetToken in state → user is redirected to /forgot-password.
 *
 * Flow:
 * - User enters new password + confirm password
 * - POST /api/auth/reset-password with resetToken + newPassword
 * - Backend verifies & consumes the reset token (single-use), updates password
 * - On success → redirect to /login
 *
 * Security:
 * - resetToken is in navigation state (not in URL), not accessible from browser history
 * - If user exits and comes back → no resetToken in state → redirected to start
 * - resetToken auto-expires in 5 min on backend (Redis TTL)
 */
const ResetPasswordPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const resetToken = location.state?.resetToken;

  // Redirect to step 1 if arrived without a reset token
  useEffect(() => {
    if (!resetToken) {
      toast.error('Session expired. Please start over.');
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate]);

  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const passwordsMatch = confirmPassword === '' || newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword });
      toast.success('Password reset successfully! You can now sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
        || 'Your reset session expired. Please request a new OTP.';
      toast.error(msg);
      // Token is invalid/expired → send back to step 1
      navigate('/forgot-password', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) return null; // redirecting

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

          {/* Step indicator: 3 of 3 */}
          <StepIndicator current={3} />

          <h2 className="mb-1 text-xl font-semibold text-gray-900">Set your new password</h2>
          <p className="mb-6 text-sm text-gray-500">
            Your OTP has been verified. Choose a strong new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  autoFocus
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Password strength hint */}
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="mt-1 text-xs text-amber-500">At least 8 characters required</p>
              )}
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
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:outline-none
                  ${!passwordsMatch
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                  }`}
              />
              {!passwordsMatch && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !passwordsMatch || newPassword.length < 8}
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
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
