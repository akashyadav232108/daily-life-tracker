import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { setCredentials, setLoading, setError } from '../authSlice';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
} from 'react-icons/hi2';

// ── Password strength helper (UI only, does not affect validation) ──
const getStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6)  score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm,  setShowConfirm]      = useState(false);
  const [focused,      setFocused]          = useState(null);

  // ── All backend logic unchanged ──
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const { confirmPassword, ...requestData } = formData;
      const response = await authAPI.register(requestData);

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        dispatch(setCredentials({ accessToken, refreshToken, user }));
        toast.success('Registration successful! Welcome aboard!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const strength = getStrength(formData.password);
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 transition-all duration-200 ${
            focused === 'fullName'
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <HiUser
            className={`h-4 w-4 shrink-0 transition-colors ${
              focused === 'fullName' ? 'text-primary' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onFocus={() => setFocused('fullName')}
            onBlur={() => setFocused(null)}
            required
            autoComplete="name"
            placeholder="John Doe"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 transition-all duration-200 ${
            focused === 'email'
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <HiEnvelope
            className={`h-4 w-4 shrink-0 transition-colors ${
              focused === 'email' ? 'text-primary' : 'text-gray-400'
            }`}
          />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 transition-all duration-200 ${
            focused === 'password'
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <HiLockClosed
            className={`h-4 w-4 shrink-0 transition-colors ${
              focused === 'password' ? 'text-primary' : 'text-gray-400'
            }`}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength bar — visual only */}
        {formData.password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength ? strengthColor[strength] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Strength:{' '}
              <span className="font-medium text-gray-700">{strengthLabel[strength]}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 transition-all duration-200 ${
            focused === 'confirm'
              ? 'border-primary ring-4 ring-primary/10'
              : formData.confirmPassword.length > 0 && !passwordsMatch
              ? 'border-red-400 ring-4 ring-red-400/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <HiLockClosed
            className={`h-4 w-4 shrink-0 transition-colors ${
              focused === 'confirm' ? 'text-primary' : 'text-gray-400'
            }`}
          />
          <input
            type={showConfirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showConfirm ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirmPassword.length > 0 && !passwordsMatch && (
          <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
        }}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {/* Login link */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">Already a member?</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Link
        to="/login"
        className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/30 hover:bg-indigo-50 hover:text-primary"
      >
        Sign in to your account
      </Link>
    </form>
  );
};

export default RegisterForm;
