import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/taskSlice';
import healthReducer from '../features/health/healthSlice';
import exerciseReducer from '../features/exercises/exerciseSlice';
import expenseReducer from '../features/expenses/expenseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    health: healthReducer,       // health-service
    exercise: exerciseReducer,   // health-service
    expenses: expenseReducer,    // expense-service (Phase 4)
    // dashboard: dashboardReducer, // Phase 5 — notification-service
    // notifications: notificationsReducer, // Phase 5
    // admin: adminReducer,         // Phase 5+
  },
});
