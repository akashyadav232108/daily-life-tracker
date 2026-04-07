import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { StepIndicator } from './ForgotPasswordPage';

const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes

/**
 * OtpVerifyPage — Step 2 of 3.
 *
 * Receives email via navigation state from ForgotPasswordPage.
 * If no email in state → redirects back to /forgot-password.
 *
 * Error behaviour:
 * - Wrong OTP (timer still running)  → inline "Incorrect OTP" error, resend stays locked
 * - Expired OTP (timer hit 0)        → inline "OTP expired" error, resend unlocked immediately
 * - Never navigates away on failure
 */
const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email passed from ForgotPasswordPage
  const email = location.state?.email;

  // Redirect to step 1 if arrived directly without email in state
  useEffect(() => {
    if (!email) {
      toast.error('Please enter your email first.');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError]   = useState(''); // inline error below input

  // ── Resend cooldown timer ──────────────────────────────────────
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start countdown as soon as page loads
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCooldown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Verify OTP ─────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      const res = await authAPI.verifyOtp({ email, otp });
      const resetToken = res.data.data?.resetToken ?? res.data.data;
      toast.success('OTP verified! Please set your new password.');
      navigate('/reset-password', { state: { email, resetToken }, replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.message || '';

      // If the 2-min UI timer already ran out → treat as OTP expired
      if (cooldown === 0) {
        setOtpError('Your OTP has expired. Please request a new one using the button below.');
        // resend button is already unlocked (cooldown === 0)
      } else {
        // Timer still running → wrong OTP entered
        setOtpError('Incorrect OTP. Please check the code and try again.');
      }

      // Also show server message in toast if it contains extra context
      if (serverMsg && serverMsg !== 'Invalid or expired OTP. Please request a new one.') {
        toast.error(serverMsg);
      }

      // Clear the OTP field so user can retype cleanly
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    setOtp('');
    setOtpError('');
    try {
      await authAPI.forgotPassword({ email });
      toast.success('New OTP sent! Check your inbox.');
      // Reset cooldown timer
      setCooldown(RESEND_COOLDOWN_SECONDS);
      startTimer();
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null; // redirecting

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

          {/* Step indicator: 2 of 3 */}
          <StepIndicator current={2} />

          <h2 className="mb-1 text-xl font-semibold text-gray-900">Enter the OTP</h2>
          <p className="mb-1 text-sm text-gray-500">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-gray-700">{email}</span>.
          </p>
          <p className="mb-6 text-xs text-gray-400">
            Wrong email?{' '}
            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
              Go back
            </Link>
          </p>

          <form onSubmit={handleVerify} className="space-y-5">

            {/* OTP input */}
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
                6-Digit OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (otpError) setOtpError(''); // clear error as user retypes
                }}
                required
                autoFocus
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                className={`w-full rounded-lg border px-3.5 py-3 text-center font-mono text-2xl tracking-[0.6em] placeholder:text-gray-300 focus:ring-2 focus:outline-none transition-colors ${
                  otpError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                }`}
              />

              {/* Inline error message */}
              {otpError && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {otpError}
                </p>
              )}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <><LoadingSpinner size="sm" /> Verifying...</> : 'Verify OTP'}
            </button>

            {/* Resend OTP row */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">Didn't receive it?</span>
              {cooldown > 0 ? (
                <span className="font-medium text-gray-400">
                  Resend in{' '}
                  <span className="font-mono text-primary">{formatCooldown(cooldown)}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-medium text-primary hover:text-primary-dark disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>

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

export default OtpVerifyPage;
