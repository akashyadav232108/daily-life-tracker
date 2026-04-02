import { healthAxios } from '../../app/axiosInstance';

// ─── Health Logs ───────────────────────────────────────────────────
export const upsertHealthLog = async (payload) => {
  const res = await healthAxios.post('/api/health/logs', payload);
  return res.data; // { success, message, data: HealthLogResponse }
};

export const fetchHealthLogs = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await healthAxios.get('/api/health/logs', { params: cleanParams });
  return res.data; // { success, message, data: HealthLogResponse[] }
};

export const fetchTodayHealthLog = async () => {
  const res = await healthAxios.get('/api/health/logs/today');
  return res.data;
};

export const fetchHealthLogByDate = async (date) => {
  const res = await healthAxios.get(`/api/health/logs/${date}`);
  return res.data;
};

export const fetchWeeklySummary = async () => {
  const res = await healthAxios.get('/api/health/summary/weekly');
  return res.data; // { success, message, data: WeeklyHealthSummaryResponse }
};

// ─── Custom Metrics ────────────────────────────────────────────────
export const createMetric = async (payload) => {
  const res = await healthAxios.post('/api/health/metrics', payload);
  return res.data;
};

export const fetchMetrics = async () => {
  const res = await healthAxios.get('/api/health/metrics');
  return res.data;
};

export const deleteMetric = async (metricId) => {
  const res = await healthAxios.delete(`/api/health/metrics/${metricId}`);
  return res.data;
};

export const logMetricValue = async (metricId, payload) => {
  const res = await healthAxios.post(`/api/health/metrics/${metricId}/log`, payload);
  return res.data;
};

export const fetchMetricLogs = async (metricId, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await healthAxios.get(`/api/health/metrics/${metricId}/logs`, { params: cleanParams });
  return res.data;
};

