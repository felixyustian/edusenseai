import axios from 'axios';

const BASE = '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('edusense_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:     (email, password) => api.post('/auth/login',    { email, password }),
  register:  (name, email, password, role = 'student') => api.post('/auth/register', { name, email, password, role }),
  demoLogin: ()                => api.get('/auth/demo-login'),
  me:        (token)           => api.get(`/auth/me?token=${token}`),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesApi = {
  list:         (params)          => api.get('/courses/', { params }),
  get:          (id)              => api.get(`/courses/${id}`),
  lessons:      (id)              => api.get(`/courses/${id}/lessons`),
  enroll:       (courseId, userId) => api.post(`/courses/${courseId}/enroll?user_id=${userId}`),
  enrollments:  (userId)          => api.get(`/courses/user/${userId}/enrollments`),
  subjects:     ()                => api.get('/courses/subjects/list'),
};

// ── Tutor ─────────────────────────────────────────────────────────────────────
export const tutorApi = {
  chat:    (messages, userId, sessionId, subject) =>
    api.post('/tutor/chat', { messages, user_id: userId, session_id: sessionId, subject }),
  history: (userId, sessionId) => api.get(`/tutor/history/${userId}`, { params: { session_id: sessionId } }),
  explain: (concept, level)    => api.post('/tutor/explain', null, { params: { concept, level } }),
  hint:    (question, context) => api.post('/tutor/hint', null, { params: { question, context } }),
};

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const quizApi = {
  generate: (body)    => api.post('/quiz/generate', body),
  get:      (id)      => api.get(`/quiz/${id}`),
  list:     (subject) => api.get('/quiz/', subject ? { params: { subject } } : {}),
  submit:   (body)    => api.post('/quiz/submit', body),
  attempts: (userId)  => api.get(`/quiz/attempts/${userId}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard:   (userId) => api.get(`/analytics/dashboard/${userId}`),
  leaderboard: (limit)  => api.get('/analytics/leaderboard', { params: { limit } }),
  summary:     (userId) => api.get(`/analytics/summary/${userId}`),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressApi = {
  get:    (userId) => api.get(`/progress/${userId}`),
  badges: (userId) => api.get(`/progress/badges/${userId}`),
};

export default api;
