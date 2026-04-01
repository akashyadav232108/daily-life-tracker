import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    // health: healthReducer,       // Phase 3 — health-service
    // exercise: exerciseReducer,   // Phase 3 — health-service
    // expenses: expensesReducer,   // Phase 4 — expense-service
    // dashboard: dashboardReducer, // Phase 5 — notification-service
    // notifications: notificationsReducer, // Phase 5
    // admin: adminReducer,         // Phase 5+
  },
});
