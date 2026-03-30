import api from './api';

export const enterpriseService = {
    getDoctorPanel: () => api.get('/enterprise/doctor-panel').then((r) => r.data),
    getAdminDashboard: () => api.get('/enterprise/admin-dashboard').then((r) => r.data),
    getAuditLogs: (limit = 100) => api.get(`/enterprise/audit-logs?limit=${limit}`).then((r) => r.data),
    listNotifications: () => api.get('/enterprise/notifications').then((r) => r.data),
    markNotificationRead: (id) => api.patch(`/enterprise/notifications/${id}/read`).then((r) => r.data),
    getHealthProfile: () => api.get('/enterprise/health-profile').then((r) => r.data),
    saveHealthProfile: (payload) => api.put('/enterprise/health-profile', payload).then((r) => r.data),
    saveDraft: (payload) => api.post('/enterprise/appointment-drafts', payload).then((r) => r.data),
};
