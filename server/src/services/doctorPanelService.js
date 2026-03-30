const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const VALID_STATUS = ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'CONFIRMED', 'PENDING'];

const isValidAppointmentStatus = (status) => VALID_STATUS.includes(status);

const getDoctorByUserId = async (userId) => {
    return prisma.doctor.findUnique({
        where: { userId },
        include: { clinic: true }
    });
};

const getDailyAppointments = async (doctorId, date) => {
    const selectedDate = date ? new Date(date) : new Date();
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    const items = await prisma.appointment.findMany({
        where: {
            doctorId,
            date: { gte: start, lte: end }
        },
        include: {
            user: { select: { id: true, name: true, email: true, tcNo: true } },
            dependent: true,
            visitRecord: true
        },
        orderBy: { date: 'asc' }
    });

    const now = new Date();
    return {
        upcoming: items.filter((i) => i.date >= now),
        past: items.filter((i) => i.date < now)
    };
};

const getAppointmentDetail = async (doctorId, appointmentId) => {
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, doctorId },
        include: {
            user: { select: { id: true, name: true, email: true, tcNo: true } },
            dependent: true,
            doctor: true,
            visitRecord: true,
            prescriptionItems: true,
            reports: true
        }
    });
    return appointment;
};

const getPatientVisitHistory = async (doctorId, patientUserId) => {
    return prisma.appointment.findMany({
        where: {
            doctorId,
            userId: patientUserId,
            status: { in: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] }
        },
        include: {
            visitRecord: true,
            prescriptionItems: true,
            reports: true
        },
        orderBy: { date: 'desc' },
        take: 30
    });
};

const upsertClinicalNote = async ({
    doctorId,
    appointmentId,
    diagnosis,
    examinationNote,
    prescriptionItems = []
}) => {
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, doctorId }
    });
    if (!appointment) return null;

    return prisma.$transaction(async (tx) => {
        const visitRecord = await tx.visitRecord.upsert({
            where: { appointmentId },
            update: { diagnosis, examinationNote },
            create: { appointmentId, doctorId, diagnosis, examinationNote }
        });

        await tx.prescriptionItem.deleteMany({ where: { appointmentId } });
        if (prescriptionItems.length > 0) {
            await tx.prescriptionItem.createMany({
                data: prescriptionItems.map((item) => ({
                    appointmentId,
                    medicineName: item.medicineName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    durationDays: item.durationDays,
                    instructions: item.instructions || null
                }))
            });
        }

        return visitRecord;
    });
};

const updateAppointmentStatus = async ({ doctorId, appointmentId, status }) => {
    if (!isValidAppointmentStatus(status)) return { error: 'INVALID_STATUS' };
    const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, doctorId } });
    if (!appointment) return null;
    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status }
    });
    return updated;
};

module.exports = {
    isValidAppointmentStatus,
    getDoctorByUserId,
    getDailyAppointments,
    getAppointmentDetail,
    getPatientVisitHistory,
    upsertClinicalNote,
    updateAppointmentStatus
};
