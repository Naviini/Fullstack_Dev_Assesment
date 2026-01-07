import axios, { AxiosInstance } from 'axios';

// Use backend on port 5001 (updated from 5000)
const API_URL = 'http://localhost:5001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleAuth: (credential: string) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksAPI = {
  getByProject: (projectId: string) => api.get(`/tasks/project/${projectId}`),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, data: any) => api.post(`/tasks/${id}/comments`, data),
  addSubtask: (taskId: string, data: any) => api.post(`/tasks/${taskId}/subtasks`, data),
  updateSubtask: (taskId: string, subtaskId: string, data: any) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data),
  logTime: (taskId: string, data: any) => api.post(`/tasks/${taskId}/time-logs`, data),
  // Admin only routes
  adminUpdate: (id: string, data: any) => api.put(`/tasks/admin/${id}`, data),
  adminDelete: (id: string) => api.delete(`/tasks/admin/${id}`),
  adminGetAll: () => api.get('/tasks/admin/list/all'),
  adminBulkUpdate: (data: any) => api.put('/tasks/admin/bulk/update', data),
  adminGetStats: () => api.get('/tasks/admin/stats/overview'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
};

export const analyticsAPI = {
  getProjectAnalytics: (projectId: string) => api.get(`/analytics/project/${projectId}`),
  getDashboardOverview: () => api.get('/analytics/dashboard/overview'),
};

export const milestonesAPI = {
  addMilestone: (projectId: string, data: any) => api.post(`/milestones/${projectId}/milestones`, data),
  updateMilestone: (projectId: string, milestoneId: string, data: any) => api.put(`/milestones/${projectId}/milestones/${milestoneId}`, data),
  addRisk: (projectId: string, data: any) => api.post(`/milestones/${projectId}/risks`, data),
  updateRisk: (projectId: string, riskId: string, data: any) => api.put(`/milestones/${projectId}/risks/${riskId}`, data),
};

export const invitationsAPI = {
  inviteMember: (projectId: string, data: any) => api.post(`/invitations/project/${projectId}/invite`, data),
  getProjectInvitations: (projectId: string) => api.get(`/invitations/project/${projectId}/invitations`),
  getMyInvitations: () => api.get('/invitations/my-invitations'),
  acceptInvitation: (invitationId: string) => api.post(`/invitations/invitations/${invitationId}/accept`),
  rejectInvitation: (invitationId: string) => api.post(`/invitations/invitations/${invitationId}/reject`),
  resendInvitation: (invitationId: string) => api.post(`/invitations/invitations/${invitationId}/resend`),
  cancelInvitation: (invitationId: string) => api.post(`/invitations/invitations/${invitationId}/cancel`),
  removeMember: (projectId: string, userId: string) => api.post(`/invitations/project/${projectId}/members/${userId}/remove`),
  updateMemberRole: (projectId: string, userId: string, data: any) => api.put(`/invitations/project/${projectId}/members/${userId}/role`, data),
};

export const collaborationAPI = {
  getItems: (projectId: string, type: string | null = null) => {
    const url = type 
      ? `/collaboration/project/${projectId}?type=${type}`
      : `/collaboration/project/${projectId}`;
    return api.get(url);
  },
  createItem: (data: any) => api.post('/collaboration', data),
  updateItem: (id: string, data: any) => api.put(`/collaboration/${id}`, data),
  deleteItem: (id: string) => api.delete(`/collaboration/${id}`),
  addReply: (itemId: string, data: any) => api.post(`/collaboration/${itemId}/replies`, data),
  likeItem: (itemId: string) => api.post(`/collaboration/${itemId}/like`),
  pinItem: (itemId: string) => api.patch(`/collaboration/${itemId}/pin`),
};

export default api;
