import { HiUserCircle, HiLockClosed } from 'react-icons/hi2';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import useAuth from '../../../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Profile overview card */}
      <div className="mb-8 flex items-center gap-4 rounded-xl bg-gradient-to-br from-primary/90 to-primary-dark/80 p-6 text-white shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.fullName}</h2>
          <p className="text-sm text-white/80">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Profile Information section */}
      <section className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <HiUserCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="px-6 py-5">
          <ProfileForm />
        </div>
      </section>

      {/* Change Password section */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <HiLockClosed className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
