import { Navigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Daily Tracker</h1>
          <p className="mt-2 text-gray-500">Start tracking your daily life today</p>
        </div>

        {/* Register Form Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Create your account</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
