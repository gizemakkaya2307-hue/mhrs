const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getHealthHistory = async (req, res) => {
    const userId = req.user.userId; // NOTE: token payload usually has userId
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                status: 'COMPLETED',
                OR: [
                    { userId },
                    { dependent: { userId } }
                ]
            },
            include: {
                doctor: true,
                dependent: true,
                reports: true,
                prescriptionItems: true,
                labResults: true,
                visitRecord: true
            },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Sağlık geçmişi listelenemedi.' });
    }
};

exports.addReport = async (req, res) => {
    const { appointmentId, title, content } = req.body;
    // Sadece doktorlar rapor ekleyebilir
    const doctorId = req.user.doctorId;

    if (!doctorId) return res.status(403).json({ error: 'Sadece doktorlar rapor ekleyebilir.' });

    try {
        const report = await prisma.report.create({
            data: {
                appointmentId: parseInt(appointmentId),
                title,
                content
            }
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Rapor oluşturulamadı.' });
    }
};
