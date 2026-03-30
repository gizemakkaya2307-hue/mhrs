const appointmentService = require('../services/appointmentService');
const { writeAuditLog } = require('../utils/audit');

/**
 * Controller katmanı sadece Request/Response manipülasyonu içindir. İş kuralları servislerden çağrılır.
 */
const getAppointments = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const appointments = await appointmentService.getAppointments(userId);
        res.json(appointments); // Global Error Handler & Response Interceptor JSON'ı formatlayacak.
    } catch (error) { next(error); }
};

const createAppointment = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { appointment, updatedSlot } = await appointmentService.createAppointment({ userId, ...req.body });
        
        const io = req.app.get('io');
        if (io) {
            io.emit('slot:update', { doctorId: appointment.doctorId, slotId: updatedSlot.id, currentCount: updatedSlot.currentCount, capacity: updatedSlot.maxCapacity, isBooked: updatedSlot.currentCount >= updatedSlot.maxCapacity });
            io.to(userId.toString()).emit('notification', { type: 'success', message: 'Randevunuz başarıyla oluşturuldu.' });
        }
        await writeAuditLog({ req, action: 'CREATE', resource: 'Appointment', resourceId: appointment.id, doctorId: appointment.doctorId });

        res.status(201).json(appointment);
    } catch (error) {
        if (error.status) res.status(error.status).json({ error: error.error });
        else next(error);
    }
};

const deleteAppointment = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { appointment, slot, penaltyApplied } = await appointmentService.deleteAppointment({ id: req.params.id, userId });
        
        const io = req.app.get('io');
        if (io && slot) {
            io.emit('slot:update', { doctorId: appointment.doctorId, slotId: slot.id, currentCount: Math.max(0, slot.currentCount - 1), capacity: slot.maxCapacity, isBooked: false });
        }
        await writeAuditLog({ req, action: 'DELETE', resource: 'Appointment', resourceId: req.params.id, doctorId: appointment.doctorId });

        res.json({ message: 'Randevu başarıyla iptal edildi.', penaltyApplied });
    } catch (error) {
        if (error.status) res.status(error.status).json({ error: error.error });
        else next(error);
    }
};

const getQuickAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.getQuickAppointment(req.body);
        res.json(result);
    } catch (error) {
         if (error.status) res.status(error.status).json({ error: error.error });
         else next(error);
    }
};

module.exports = { getAppointments, createAppointment, deleteAppointment, getQuickAppointment };
