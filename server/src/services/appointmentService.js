const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise Level Business Logic - Appointment Service
 */
class AppointmentService {
    async getAppointments(userId) {
        return await prisma.appointment.findMany({
            where: { userId },
            include: { doctor: { include: { clinic: true } } },
            orderBy: { date: 'desc' }
        });
    }

    async createAppointment({ userId, doctorId, timeSlotId, notes, dependentId }) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.penaltyUntil && new Date(user.penaltyUntil) > new Date()) {
            throw { status: 403, error: `Cezalı durumdasınız. ${new Date(user.penaltyUntil).toLocaleDateString()} tarihine kadar işlem yapamazsınız.` };
        }

        const slot = await prisma.timeSlot.findUnique({ where: { id: parseInt(timeSlotId) } });

        // Database Lock, Kapasite kontrolü
        if (!slot || slot.currentCount >= slot.maxCapacity || slot.doctorId !== parseInt(doctorId)) {
             throw { status: 400, error: 'Seçilen saat dilimi kapasitesi tamamen dolmuştur. Lütfen alternatif bir saat seçiniz.' };
        }

        const existingApp = await prisma.appointment.findFirst({
            where: { userId, date: slot.startTime, status: 'PENDING' }
        });
        if (existingApp) throw { status: 400, error: 'Aynı saat diliminde aktif başka bir randevunuz bulunuyor.' };

        // Transaction & Kapasite Asimini Saniyede Engelleyen Guvenli Optmistic Locking
        const [appointment, updateResult] = await prisma.$transaction([
            prisma.appointment.create({
                data: {
                    userId, doctorId: parseInt(doctorId), date: slot.startTime,
                    notes: notes || '', dependentId: dependentId ? parseInt(dependentId) : null
                }
            }),
            prisma.timeSlot.updateMany({
                where: { id: slot.id, currentCount: { lt: slot.maxCapacity } },
                data: { currentCount: { increment: 1 } }
            })
        ]);

        if (updateResult.count === 0) {
             throw { status: 400, error: 'Üzgünüz! Siz onaylarken saniyeler farkıyla başka bir hasta kapasiteyi doldurdu. Lütfen başka bir saate deneyiniz.' };
        }

        const updatedSlot = await prisma.timeSlot.findUnique({ where: { id: parseInt(timeSlotId) } });
        return { appointment, updatedSlot };
    }

    async deleteAppointment({ id, userId }) {
        const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
        if (!appointment) throw { status: 404, error: 'Randevu bulunamadı' };
        if (appointment.userId !== userId) throw { status: 403, error: 'Yetkisiz işlem' };

        const diffHours = (new Date(appointment.date) - new Date()) / (1000 * 60 * 60);

        let penaltyApplied = false;
        if (diffHours < 24 && diffHours > 0) {
            const penaltyDate = new Date();
            penaltyDate.setDate(penaltyDate.getDate() + 15);
            await prisma.user.update({ where: { id: userId }, data: { penaltyUntil: penaltyDate } });
            penaltyApplied = true;
        }

        const slot = await prisma.timeSlot.findFirst({
            where: { doctorId: appointment.doctorId, startTime: appointment.date }
        });

        // İptalde kapasiteyi geri kazanıyoruz
        await prisma.$transaction([
            prisma.appointment.delete({ where: { id: parseInt(id) } }),
            ...(slot && slot.currentCount > 0 ? [prisma.timeSlot.update({ where: { id: slot.id }, data: { currentCount: { decrement: 1 } } })] : [])
        ]);

        return { appointment, slot, penaltyApplied };
    }

    async getQuickAppointment({ city, district, clinicId }) {
        let docWhere = {};
        if (clinicId) docWhere.clinicId = parseInt(clinicId);
        
        let doctors = await prisma.doctor.findMany({
            where: { ...docWhere, clinic: { city: city || undefined, district: district || undefined } },
            select: { id: true, name: true, branch: true, hospital: true }
        });

        if (doctors.length === 0) throw { status: 404, error: 'Kriterlere uygun doktor bulunamadı.' };

        // Sıradaki ilk müsait ve kapasiteden yememiş slot
        const now = new Date();
        const availableSlot = await prisma.timeSlot.findFirst({
            where: {
                doctorId: { in: doctors.map(d => d.id) },
                startTime: { gt: now },
                currentCount: { lt: prisma.timeSlot.fields.maxCapacity } 
            },
            orderBy: { startTime: 'asc' },
            include: { doctor: { include: { clinic: true } } }
        });

        if (!availableSlot) throw { status: 404, error: 'Yakın tarihte uygun randevu bulunamadı. Lütfen direkt tarih arayınız.' };
        return { slot: availableSlot, doctor: availableSlot.doctor };
    }
}
module.exports = new AppointmentService();
