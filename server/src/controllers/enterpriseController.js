const { PrismaClient } = require('@prisma/client');
const { writeAuditLog } = require('../utils/audit');
const { addNotificationToQueue } = require('../utils/queue');

const prisma = new PrismaClient();

const parseId = (value) => parseInt(value, 10);

const listDoctorPanel = async (req, res) => {
    const doctorByUser = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
    const doctorId = doctorByUser?.id || (req.user.role === 'ADMIN' && req.query.doctorId ? parseId(req.query.doctorId) : null);
    const whereDoctor = doctorId ? { doctorId } : {};
    const [upcoming, completed, waitlists] = await Promise.all([
        prisma.appointment.findMany({
            where: { ...whereDoctor, date: { gte: new Date() } },
            include: { user: true, dependent: true, labResults: true, prescriptionItems: true },
            orderBy: { date: 'asc' },
            take: 100
        }),
        prisma.appointment.count({ where: { ...whereDoctor, status: 'COMPLETED' } }),
        prisma.waitingList.findMany({
            where: whereDoctor,
            include: { user: true, doctor: true },
            orderBy: { createdAt: 'asc' },
            take: 100
        })
    ]);
    res.json({ upcoming, completed, waitlists });
};

const upsertHealthProfile = async (req, res) => {
    const { bloodType, allergies, chronicConditions, medications, emergencyContact, notes } = req.body;
    const profile = await prisma.healthProfile.upsert({
        where: { userId: req.user.userId },
        update: { bloodType, allergies, chronicConditions, medications, emergencyContact, notes },
        create: { userId: req.user.userId, bloodType, allergies, chronicConditions, medications, emergencyContact, notes }
    });
    await writeAuditLog({ req, action: 'UPSERT', resource: 'HealthProfile', resourceId: profile.id });
    res.json(profile);
};

const getHealthProfile = async (req, res) => {
    const profile = await prisma.healthProfile.findUnique({ where: { userId: req.user.userId } });
    res.json(profile || null);
};

const createNotification = async (req, res) => {
    const { userId, title, message, type = 'INFO', metadata } = req.body;
    const notification = await prisma.notification.create({
        data: { userId: parseId(userId), title, message, type, metadata: metadata ? JSON.stringify(metadata) : null }
    });
    const io = req.app.get('io');
    io?.to(String(userId)).emit('notification', { type: type.toLowerCase(), message, title });
    await addNotificationToQueue({ type: 'in_app', toUserId: parseId(userId), title, body: message });
    await writeAuditLog({ req, action: 'CREATE', resource: 'Notification', resourceId: notification.id });
    res.status(201).json(notification);
};

const listNotifications = async (req, res) => {
    const items = await prisma.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        take: 100
    });
    res.json(items);
};

const markNotificationRead = async (req, res) => {
    const id = parseId(req.params.id);
    const exists = await prisma.notification.findFirst({ where: { id, userId: req.user.userId } });
    if (!exists) return res.status(404).json({ error: 'Bildirim bulunamadı.' });
    const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() }
    });
    res.json(notification);
};

const saveAppointmentDraft = async (req, res) => {
    const payload = req.body || {};
    const { id, ...draftData } = payload;
    const draft = await prisma.appointmentDraft.upsert({
        where: { id: id || -1 },
        update: { ...draftData, userId: req.user.userId },
        create: { ...draftData, userId: req.user.userId }
    });
    res.json(draft);
};

const listAppointmentDrafts = async (req, res) => {
    const drafts = await prisma.appointmentDraft.findMany({
        where: { userId: req.user.userId, status: 'IN_PROGRESS' },
        orderBy: { updatedAt: 'desc' }
    });
    res.json(drafts);
};

const addPrescriptionItem = async (req, res) => {
    const { appointmentId, medicineName, dosage, frequency, durationDays, instructions } = req.body;
    const appointment = await prisma.appointment.findUnique({ where: { id: parseId(appointmentId) } });
    if (!appointment) return res.status(404).json({ error: 'Randevu bulunamadı.' });
    const item = await prisma.prescriptionItem.create({
        data: { appointmentId: parseId(appointmentId), medicineName, dosage, frequency, durationDays: parseId(durationDays), instructions }
    });
    await writeAuditLog({ req, action: 'CREATE', resource: 'PrescriptionItem', resourceId: item.id, doctorId: appointment.doctorId });
    res.status(201).json(item);
};

const listPrescriptionItems = async (req, res) => {
    const appointmentId = parseId(req.params.appointmentId);
    const items = await prisma.prescriptionItem.findMany({ where: { appointmentId }, orderBy: { createdAt: 'desc' } });
    res.json(items);
};

const addLabResult = async (req, res) => {
    const { appointmentId, testName, resultValue, unit, referenceRange, status, notes } = req.body;
    const labResult = await prisma.labResult.create({
        data: { appointmentId: parseId(appointmentId), testName, resultValue, unit, referenceRange, status, notes }
    });
    await writeAuditLog({ req, action: 'CREATE', resource: 'LabResult', resourceId: labResult.id });
    res.status(201).json(labResult);
};

const listLabResults = async (req, res) => {
    const appointmentId = parseId(req.params.appointmentId);
    const data = await prisma.labResult.findMany({ where: { appointmentId }, orderBy: { createdAt: 'desc' } });
    res.json(data);
};

const adminDashboard = async (_req, res) => {
    const [users, doctors, appointments, waitlists, notifications, unreadNotifications, auditLogs, waitlistItems] = await Promise.all([
        prisma.user.count(),
        prisma.doctor.count(),
        prisma.appointment.count(),
        prisma.waitingList.count(),
        prisma.notification.count(),
        prisma.notification.count({ where: { isRead: false } }),
        prisma.auditLog.count(),
        prisma.waitingList.findMany({ include: { user: true, doctor: true }, orderBy: { createdAt: 'desc' }, take: 50 })
    ]);
    res.json({ users, doctors, appointments, waitlists, notifications, unreadNotifications, auditLogs, waitlistItems });
};

const listAuditLogs = async (req, res) => {
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: parseId(req.query.limit || 100)
    });
    res.json(logs);
};

const emitSlotUpdate = async (req, res) => {
    const { doctorId, slotId, isBooked } = req.body;
    const io = req.app.get('io');
    io?.emit('slot:update', { doctorId: parseId(doctorId), slotId: parseId(slotId), isBooked: !!isBooked, at: new Date().toISOString() });
    res.json({ ok: true });
};

module.exports = {
    listDoctorPanel,
    upsertHealthProfile,
    getHealthProfile,
    createNotification,
    listNotifications,
    markNotificationRead,
    saveAppointmentDraft,
    listAppointmentDrafts,
    addPrescriptionItem,
    listPrescriptionItems,
    addLabResult,
    listLabResults,
    adminDashboard,
    listAuditLogs,
    emitSlotUpdate
};
