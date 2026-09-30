// React
import { useEffect } from 'react';

// Redux
import { useDispatch } from 'react-redux';

// APIs & slices
import authAPI from './features/auth/authAPI';
import { updateUser, clearCredentials, setCredentials } from './features/auth/authSlice';


import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageLayout from './components/layout/PageLayout';
import { RegisterPromptProvider } from './contexts/RegisterPromptContext';

// Auth pages (no layout — standalone)
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import OtpVerifyPage from './features/auth/pages/OtpVerifyPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';

// App pages (guest-browsable user modules; profile/admin stay protected)
import DashboardPage from './features/dashboard/pages/DashboardPage';
import TasksPage from './features/tasks/pages/TasksPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage';
import AdminTasksPage from './features/admin/pages/AdminTasksPage';
import AdminUsersPage from './features/admin/pages/AdminUsersPage';
import HealthPage from './features/health/pages/HealthPage';
import ExercisePage from './features/exercises/pages/ExercisePage';
import ExpensePage from './features/expenses/pages/ExpensePage';
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import AboutPage from './features/about/pages/AboutPage';

const App = () => {

      const dispatch = useDispatch();

      const navigate = useNavigate() //  ADD THIS

      const location = useLocation();

      useEffect(() => {
        const handleStorage = async (event) => {
          if (event.key === "event" && event.newValue) {
            try {
              const data = JSON.parse(event.newValue);

//               if (data?.type === "PROFILE_UPDATED") {
//                 console.log("Profile updated in another tab → syncing...");
//
//                 const res = await authAPI.getProfile();
//                 dispatch(updateUser(res.data.data));
//               }
//
//               if (data?.type === "LOGOUT") {
//                 console.log("Logout from another tab → syncing...");
//
//                 dispatch(clearCredentials());
//                 navigate("/login");
//               }
//
//               if (data?.type === "LOGIN") {
//                 console.log("Login from another tab → syncing...");
//
//                 const user = JSON.parse(localStorage.getItem("user"));
//                 if (user) {
//                   dispatch(updateUser(user));
//                 }
//
//                 navigate("/");
//               }

                switch (data?.type) {
                  case "PROFILE_UPDATED":
                    console.log("Profile updated in another tab → syncing...");
                    const res = await authAPI.getProfile();
                    dispatch(updateUser(res.data.data));
                    break;

                  case "LOGOUT":
                    console.log("Logout from another tab → syncing...");
                    dispatch(clearCredentials());
                    if (location.pathname !== "/login") {
                        navigate("/login");
                    }
                    break;

                  case "LOGIN":
                    console.log("Login from another tab → syncing...");

                    const user = JSON.parse(localStorage.getItem("user"));
                    const accessToken = localStorage.getItem("accessToken");
                    const refreshToken = localStorage.getItem("refreshToken");

                    if (user && accessToken) {
                      dispatch(setCredentials({ user, accessToken, refreshToken }));
                    }

                    if (location.pathname === "/login") {
                        navigate("/");
                    }
                    break;
                }

            } catch (err) {
              console.error("Sync error", err);
            }
          }
        };

        window.addEventListener("storage", handleStorage);

        return () => {
          window.removeEventListener("storage", handleStorage);
        };
      }, [dispatch, navigate, location]);

  return (
    <RegisterPromptProvider>
      <Routes>
        {/* ── Public auth routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp"      element={<OtpVerifyPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── Guest-browsable user modules (mutations gated in UI) ── */}
        <Route
          path="/"
          element={
            <PageLayout>
              <DashboardPage />
            </PageLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <PageLayout>
              <TasksPage />
            </PageLayout>
          }
        />
        <Route
          path="/health"
          element={
            <PageLayout>
              <HealthPage />
            </PageLayout>
          }
        />
        <Route
          path="/exercise"
          element={
            <PageLayout>
              <ExercisePage />
            </PageLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <PageLayout>
              <ExpensePage />
            </PageLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <PageLayout>
              <NotificationsPage />
            </PageLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PageLayout>
              <AboutPage />
            </PageLayout>
          }
        />

        {/* ── Auth-required ── */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageLayout>
                <ProfilePage />
              </PageLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin Routes ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PageLayout>
                  <AdminDashboardPage />
                </PageLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PageLayout>
                  <AdminTasksPage />
                </PageLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PageLayout>
                  <AdminUsersPage />
                </PageLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="mt-2 text-gray-500">Page not found</p>
                <a href="/" className="mt-4 inline-block text-primary hover:text-primary-dark">
                  Go back home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </RegisterPromptProvider>
  );
};

export default App;
