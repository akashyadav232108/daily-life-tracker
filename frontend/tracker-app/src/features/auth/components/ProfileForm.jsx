import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser, setLoading } from '../authSlice';
import authAPI from '../authAPI';
import toast from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { user, loading } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [telegramChatId, setTelegramChatId] = useState(user?.telegramChatId || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    dispatch(setLoading(true));
    try {
      const { data } = await authAPI.updateProfile({ fullName: fullName.trim(), telegramChatId: telegramChatId.trim() });
      dispatch(updateUser(data.data)); // data.data = UserResponse
      toast.success(data.message || 'Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={100}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      {/* Telegram Chat ID */}
      <div>
        <label htmlFor="telegramChatId" className="block text-sm font-medium text-gray-700">
          Telegram Chat ID
        </label>
        <input
          id="telegramChatId"
          type="text"
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          maxLength={100}
          placeholder="Enter your Telegram chat ID for notifications"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">
          Used for receiving notifications via the Telegram bot.
        </p>
      </div>

      {/* Role (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <div className="mt-1">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {user?.role || 'USER'}
          </span>
        </div>
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
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
