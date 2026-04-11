import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { setCredentials, setLoading, setError } from '../authSlice';
import authAPI from '../authAPI';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowRight } from 'react-icons/hi2';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  // ── All backend logic unchanged ──
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await authAPI.login(formData);

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        dispatch(setCredentials({ accessToken, refreshToken, user }));
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          Email address
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
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <HiEyeSlash className="h-4 w-4" />
            ) : (
              <HiEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          className="h-4 w-4 rounded border-gray-300 accent-primary"
        />
        <label htmlFor="remember" className="text-sm text-gray-600">
          Keep me signed in
        </label>
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
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">New here?</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Register link */}
      <Link
        to="/register"
        className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/30 hover:bg-indigo-50 hover:text-primary"
      >
        Create a free account
      </Link>
    </form>
  );
};

export default LoginForm;
