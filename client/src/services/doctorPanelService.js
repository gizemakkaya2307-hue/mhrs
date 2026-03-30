import api from './api';

export const doctorPanelService = {
    getDailyAppointments: (date) => api.get('/doctor-panel/appointments', { params: { date } }).then((r) => r.data),
    getAppointmentDetail: (appointmentId) => api.get(`/doctor-panel/appointments/${appointmentId}`).then((r) => r.data),
    getPatientHistory: (patientUserId) => api.get(`/doctor-panel/patients/${patientUserId}/history`).then((r) => r.data),
    addClinicalNote: (appointmentId, payload) =>
        api.post(`/doctor-panel/appointments/${appointmentId}/clinical-note`, payload).then((r) => r.data),
    updateStatus: (appointmentId, status) =>
        api.patch(`/doctor-panel/appointments/${appointmentId}/status`, { status }).then((r) => r.data),
    addLabResult: (payload) =>
        api.post(`/enterprise/lab-results`, payload).then((r) => r.data)
};
