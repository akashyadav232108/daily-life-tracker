import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiExclamationTriangle,
  HiTrash,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiShieldExclamation,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import authAPI from '../authAPI';
import { clearCredentials } from '../authSlice';
import useAuth from '../../../hooks/useAuth';

/**
 * DeleteAccountSection — "Danger Zone" card shown at the bottom of ProfilePage.
 *
 * Flow:
 *   1. User clicks "Delete My Account"
 *   2. Warning modal — explains consequences, asks for explicit confirmation
 *   3. Password modal — user must type their current password to confirm
 *   4. On success → clears auth state → redirects to /login
 *
 * SUPER_ADMIN accounts are blocked (server + UI).
 */
const DeleteAccountSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  // 'idle' | 'warning' | 'confirm'
  const [step, setStep] = useState('idle');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep('idle');
    setPassword('');
    setShowPassword(false);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await authAPI.deleteAccount({ password });
      toast.success('Your account has been permanently deleted.');
      dispatch(clearCredentials());
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Danger Zone Card ── */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-red-200">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
          <HiExclamationTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
        </div>

        <div className="px-6 py-5">
          {isSuperAdmin ? (
            /* Super Admin — blocked with explanation */
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
              <HiShieldExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Super Admin accounts cannot be self-deleted
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  To protect system integrity, a Super Admin account can only be removed by another
                  Super Admin via the admin panel. Contact your system owner if needed.
                </p>
              </div>
            </div>
          ) : (
            /* Regular USER / ADMIN — show delete option */
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Delete your account</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Permanently remove your account and all associated data. This action is
                  irreversible.
                </p>
              </div>
              <button
                onClick={() => setStep('warning')}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-400"
              >
                <HiTrash className="h-4 w-4" />
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Step 1: Warning Modal ── */}
      {step === 'warning' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Icon + title */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <HiExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete your account?</h3>
                <p className="text-xs text-gray-500">This cannot be undone</p>
              </div>
            </div>

            {/* Warning details */}
            <div className="mb-6 space-y-2 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
              <p className="text-sm font-semibold text-red-700">
                ⚠️ You will permanently lose:
              </p>
              <ul className="ml-4 list-disc space-y-1 text-xs text-red-600">
                <li>Your profile and account credentials</li>
                <li>All tasks, health logs, and exercise plans</li>
                <li>All expense records and budgets</li>
                <li>All notifications and settings</li>
              </ul>
              <p className="mt-2 text-xs font-medium text-red-700">
                Logged in as: <span className="font-bold">{user?.email}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={reset}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                No, Keep My Account
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <HiTrash className="h-4 w-4" />
                Yes, I Understand — Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Password Confirmation Modal ── */}
      {step === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Icon + title */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <HiLockClosed className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm with your password</h3>
                <p className="text-xs text-gray-500">
                  Enter your current password to permanently delete your account
                </p>
              </div>
            </div>

            {/* Password input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleDelete()}
                  placeholder="Enter your password"
                  autoFocus
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <HiEyeSlash className="h-4 w-4" />
                  ) : (
                    <HiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                This action is permanent and cannot be reversed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={reset}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !password.trim()}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiTrash className="h-4 w-4" />
                {loading ? 'Deleting…' : 'Permanently Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountSection;
