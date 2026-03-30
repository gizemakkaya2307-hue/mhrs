const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addUnavailability = async (req, res) => {
    const { startTime, endTime, reason } = req.body;
    const doctorId = req.user.doctorId; // Sadece doktorlar ekleyebilir (veya admin)

    if (!doctorId) return res.status(403).json({ error: 'Sadece doktorlar izin tanımlayabilir.' });

    try {
        const unavailability = await prisma.unavailability.create({
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                reason,
                doctorId
            }
        });

        // Çakışan boş slotları iptal et veya kapat
        await prisma.timeSlot.updateMany({
            where: {
                doctorId,
                startTime: { gte: new Date(startTime) },
                endTime: { lte: new Date(endTime) },
                isBooked: false
            },
            data: { isBooked: true } // Veya silinebilir
        });

        res.status(201).json(unavailability);
    } catch (error) {
        res.status(500).json({ error: 'İzin tanımlanamadı.' });
    }
};

exports.getUnavailabilities = async (req, res) => {
    const doctorId = req.user.doctorId || req.params.doctorId;
    try {
        const list = await prisma.unavailability.findMany({
            where: { doctorId: parseInt(doctorId) },
            orderBy: { startTime: 'asc' }
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'İzinler listelenemedi.' });
    }
};
