import { useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import authAPI from '../authAPI';
import toast from 'react-hot-toast';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.changePassword({ currentPassword, newPassword });
      toast.success(data.message || 'Password changed successfully');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <div className="relative mt-1">
          <input
            id="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showCurrent ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative mt-1">
          <input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            maxLength={100}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showNew ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters.</p>
      </div>

      {/* Confirm New Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Changing…
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
