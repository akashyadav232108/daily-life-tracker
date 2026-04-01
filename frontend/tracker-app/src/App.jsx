import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageLayout from './components/layout/PageLayout';

// Auth pages (no layout — standalone)
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

// Protected pages
import DashboardPage from './features/dashboard/pages/DashboardPage';
import TasksPage from './features/tasks/pages/TasksPage';
import ProfilePage from './features/auth/pages/ProfilePage';

const App = () => {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected Routes (require authentication) ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PageLayout>
              <DashboardPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Task routes */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <PageLayout>
              <TasksPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile page */}
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

      {/* Future service pages — placeholders */}
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <PageLayout>
              <PlaceholderPage title="Health" message="Coming in Phase 3 — Health tracking" />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise"
        element={
          <ProtectedRoute>
            <PageLayout>
              <PlaceholderPage title="Exercise" message="Coming in Phase 3 — Workout tracking" />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <PageLayout>
              <PlaceholderPage title="Expenses" message="Coming in Phase 4 — Expense tracking" />
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
                <PlaceholderPage
                  title="Admin Dashboard"
                  message="Admin panel will show platform stats once all services are integrated."
                />
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
                <PlaceholderPage
                  title="User Management"
                  message="User management will be available once admin features are completed."
                />
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
  );
};

/**
 * Simple placeholder for routes that are not yet implemented.
 */
const PlaceholderPage = ({ title, message }) => (
  <div className="py-12 text-center">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <div className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-gray-300 bg-white p-8">
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

export default App;
