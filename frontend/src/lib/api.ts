import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const studentsAPI = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const trainersAPI = {
  getAll: (params?: any) => api.get('/trainers', { params }),
  getById: (id: string) => api.get(`/trainers/${id}`),
  create: (data: any) => api.post('/trainers', data),
  update: (id: string, data: any) => api.put(`/trainers/${id}`, data),
};

export const coursesAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const batchesAPI = {
  getAll: (params?: any) => api.get('/batches', { params }),
  getById: (id: string) => api.get(`/batches/${id}`),
  create: (data: any) => api.post('/batches', data),
  update: (id: string, data: any) => api.put(`/batches/${id}`, data),
  enroll: (batchId: string, studentId: string) => api.post(`/batches/${batchId}/enroll`, { studentId }),
};

export const attendanceAPI = {
  getAll: (params?: any) => api.get('/attendance', { params }),
  getSummary: (params?: any) => api.get('/attendance/summary', { params }),
  createSession: (data: any) => api.post('/attendance/session', data),
  markAttendance: (sessionId: string, attendanceData: any[]) =>
    api.post('/attendance/mark', { sessionId, attendanceData }),
};

export const assessmentsAPI = {
  getAll: (params?: any) => api.get('/assessments', { params }),
  getById: (id: string) => api.get(`/assessments/${id}`),
  create: (data: any) => api.post('/assessments', data),
  submit: (id: string, data: any) => api.post(`/assessments/${id}/submit`, data),
  getResults: (params?: any) => api.get('/assessments/results/all', { params }),
};

export const feedbackAPI = {
  getAll: (params?: any) => api.get('/feedback', { params }),
  getAnalytics: () => api.get('/feedback/analytics'),
  create: (data: any) => api.post('/feedback', data),
};

export const placementsAPI = {
  getAll: (params?: any) => api.get('/placements', { params }),
  create: (data: any) => api.post('/placements', data),
  update: (id: string, data: any) => api.put(`/placements/${id}`, data),
  getStats: () => api.get('/placements/stats'),
  getCompanies: (params?: any) => api.get('/placements/companies', { params }),
  createCompany: (data: any) => api.post('/placements/companies', data),
};

export const documentsAPI = {
  getAll: (params?: any) => api.get('/documents', { params }),
  upload: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verify: (id: string) => api.put(`/documents/${id}/verify`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const reportsAPI = {
  getStudentProgress: (params?: any) => api.get('/reports/student-progress', { params }),
  getTrainerPerformance: () => api.get('/reports/trainer-performance'),
  getPlacement: () => api.get('/reports/placement'),
  getAttendance: (params?: any) => api.get('/reports/attendance', { params }),
  getNsdcCompliance: () => api.get('/reports/nsdc-compliance'),
};

export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
};

export default api;
