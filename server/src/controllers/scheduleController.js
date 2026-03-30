const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const generateSlots = async (req, res) => {
    const { doctorId, date, startTime, endTime, intervalMinutes } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Eksik bilgi: Doktor, tarih, başlangıç ve bitiş saatleri zorunludur.' });
    }

    try {
        const interval = intervalMinutes || 30;
        const slots = [];
        let current = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + interval * 60000);
            if (slotEnd <= end) {
                slots.push({
                    doctorId: parseInt(doctorId),
                    startTime: new Date(current),
                    endTime: new Date(slotEnd),
                    isBooked: false
                });
            }
            current = slotEnd;
        }

        const createdSlots = await prisma.timeSlot.createMany({
            data: slots
        });

        logger.info(`Dr. #${doctorId} için ${date} tarihine ${slots.length} yeni slot üretildi.`);
        res.status(201).json({ message: `${slots.length} yeni randevu dilimi oluşturuldu.`, count: createdSlots.count });
    } catch (error) {
        logger.error('Slot generation error: ', error);
        res.status(500).json({ error: 'Mesai oluşturulurken hata meydana geldi.' });
    }
};

const deleteDoctorSlots = async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        await prisma.timeSlot.deleteMany({
            where: {
                doctorId: parseInt(doctorId),
                isBooked: false,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        res.json({ message: 'Müsait olan mesai dilimleri temizlendi.' });
    } catch (error) {
        res.status(500).json({ error: 'Silme işlemi başarısız.' });
    }
};

module.exports = { generateSlots, deleteDoctorSlots };
