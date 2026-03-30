const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAvailableSlots = async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query; // Örn: 2024-02-11

    try {
        if (!date) return res.status(400).json({ error: 'Tarih zorunludur' });

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Önce bu tarihte slot var mı bak.
        let slots = await prisma.timeSlot.findMany({
            where: {
                doctorId: parseInt(doctorId),
                startTime: { gte: targetDate, lte: endOfDay }
            },
            orderBy: { startTime: 'asc' }
        });

        // 2. Eğer slot hiç yoksa (Kapasite Dolu Hatasının Kök Nedeni Çözümü - Data drought), bu güne BAŞLANGIÇ MESAİ oluştur (Kapasiteli, 15dk aralıklarla)
        if (slots.length === 0) {
            // MHRS Demo için her güne standart 09:00 - 17:00 arası 15 dakikalık maksimum 2 kapasiteli vardiya ekler
            const newSlots = [];
            let current = new Date(targetDate);
            current.setHours(9, 0, 0, 0); 
            const endWork = new Date(targetDate);
            endWork.setHours(17, 0, 0, 0); 

            while (current < endWork) {
                const slotEnd = new Date(current.getTime() + 15 * 60000); // 15 dk
                // Öğle arası (12:00 - 13:00)
                if (current.getHours() !== 12) {
                    newSlots.push({
                        doctorId: parseInt(doctorId),
                        startTime: new Date(current),
                        endTime: new Date(slotEnd),
                        maxCapacity: 2,  // 15 dakikada en fazla 2 kişi muayene olabilir (Kapasiteli model)
                        currentCount: 0
                    });
                }
                current = slotEnd;
            }
            
            await prisma.timeSlot.createMany({ data: newSlots });
            
            // Generate ettikten sonra tekrar çek
            slots = await prisma.timeSlot.findMany({
                where: {
                    doctorId: parseInt(doctorId),
                    startTime: { gte: targetDate, lte: endOfDay }
                },
                orderBy: { startTime: 'asc' }
            });
        }

        // 3. Filtre: Saati/Tarihi geçmiş slotları veya currentCount >= maxCapacity olanları ele
        const now = new Date();
        const availableSlots = slots.map(slot => ({
            id: slot.id,
            time: slot.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isBooked: slot.currentCount >= slot.maxCapacity || slot.startTime <= now, // maxCap dolu mu veya saat geçti mi?
            currentCount: slot.currentCount,
            maxCapacity: slot.maxCapacity,
            startTime: slot.startTime
        }));

        res.json(availableSlots);
    } catch (error) {
        console.error("Slot Error:", error);
        res.status(500).json({ error: 'Saat dilimleri getirilemedi' });
    }
};

module.exports = { getAvailableSlots };
