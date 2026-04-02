import { healthAxios } from '../../app/axiosInstance';

// Uses health-service base URL

// ─── Plans ────────────────────────────────────────────────────────
export const createPlan = async (payload) => {
  const res = await healthAxios.post('/api/exercises/plans', payload);
  return res.data;
};

export const fetchPlans = async () => {
  const res = await healthAxios.get('/api/exercises/plans');
  return res.data;
};

export const fetchActivePlan = async () => {
  const res = await healthAxios.get('/api/exercises/plans/active');
  return res.data;
};

export const fetchPlanById = async (id) => {
  const res = await healthAxios.get(`/api/exercises/plans/${id}`);
  return res.data;
};

export const updatePlan = async (id, payload) => {
  const res = await healthAxios.put(`/api/exercises/plans/${id}`, payload);
  return res.data;
};

export const deletePlan = async (id) => {
  const res = await healthAxios.delete(`/api/exercises/plans/${id}`);
  return res.data;
};

export const activatePlan = async (id) => {
  const res = await healthAxios.patch(`/api/exercises/plans/${id}/activate`);
  return res.data;
};

export const fetchTodayPlanned = async () => {
  const res = await healthAxios.get('/api/exercises/plans/today');
  return res.data;
};

// ─── Logs ─────────────────────────────────────────────────────────
export const logExercise = async (payload) => {
  const res = await healthAxios.post('/api/exercises/logs', payload);
  return res.data;
};

export const fetchExerciseLogs = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await healthAxios.get('/api/exercises/logs', { params: cleanParams });
  return res.data;
};

export const fetchExerciseLogsToday = async () => {
  const res = await healthAxios.get('/api/exercises/logs/today');
  return res.data;
};

export const fetchExerciseLogsByDate = async (date) => {
  const res = await healthAxios.get(`/api/exercises/logs/${date}`);
  return res.data;
};

export const deleteExerciseLog = async (id) => {
  const res = await healthAxios.delete(`/api/exercises/logs/${id}`);
  return res.data;
};

