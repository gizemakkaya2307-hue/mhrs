const service = require('../services/doctorPanelService');
const { writeAuditLog } = require('../utils/audit');
const {
    doctorDailyQuerySchema,
    appointmentParamSchema,
    patientParamSchema,
    clinicalNoteSchema,
    appointmentStatusSchema
} = require('../validations/doctorPanelSchema');

const getDoctorContext = async (req) => {
    const doctor = await service.getDoctorByUserId(req.user.userId);
    if (!doctor) {
        const error = new Error('Doktor profili bulunamadı. Admin ile iletişime geçiniz.');
        error.statusCode = 403;
        throw error;
    }
    return doctor;
};

const getMyDailyAppointments = async (req, res, next) => {
    try {
        const { date } = doctorDailyQuerySchema.parse(req.query);
        const doctor = await getDoctorContext(req);
        const data = await service.getDailyAppointments(doctor.id, date);
        res.json({ doctor, ...data });
    } catch (error) {
        next(error);
    }
};

const getAppointmentDetail = async (req, res, next) => {
    try {
        const { appointmentId } = appointmentParamSchema.parse(req.params);
        const doctor = await getDoctorContext(req);
        const appointment = await service.getAppointmentDetail(doctor.id, appointmentId);
        if (!appointment) return res.status(404).json({ error: 'Randevu bulunamadı.' });
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

const getPatientHistory = async (req, res, next) => {
    try {
        const { patientUserId } = patientParamSchema.parse(req.params);
        const doctor = await getDoctorContext(req);
        const items = await service.getPatientVisitHistory(doctor.id, patientUserId);
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const addClinicalNote = async (req, res, next) => {
    try {
        const { appointmentId } = appointmentParamSchema.parse(req.params);
        const payload = clinicalNoteSchema.parse(req.body);
        const doctor = await getDoctorContext(req);
        const visitRecord = await service.upsertClinicalNote({
            doctorId: doctor.id,
            appointmentId,
            ...payload
        });
        if (!visitRecord) return res.status(404).json({ error: 'Randevu bulunamadı.' });
        await writeAuditLog({
            req,
            action: 'UPSERT',
            resource: 'VisitRecord',
            resourceId: visitRecord.id,
            doctorId: doctor.id,
            details: { appointmentId }
        });
        res.status(201).json(visitRecord);
    } catch (error) {
        next(error);
    }
};

const setAppointmentStatus = async (req, res, next) => {
    try {
        const { appointmentId } = appointmentParamSchema.parse(req.params);
        const { status } = appointmentStatusSchema.parse(req.body);
        const doctor = await getDoctorContext(req);
        const updated = await service.updateAppointmentStatus({ doctorId: doctor.id, appointmentId, status });
        if (!updated) return res.status(404).json({ error: 'Randevu bulunamadı.' });
        if (updated.error === 'INVALID_STATUS') return res.status(400).json({ error: 'Geçersiz randevu durumu.' });
        await writeAuditLog({
            req,
            action: 'UPDATE',
            resource: 'AppointmentStatus',
            resourceId: appointmentId,
            doctorId: doctor.id,
            details: { status }
        });
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyDailyAppointments,
    getAppointmentDetail,
    getPatientHistory,
    addClinicalNote,
    setAppointmentStatus
};
